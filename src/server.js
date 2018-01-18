const config = require('config');
const express = require('express');
const logger = require('morgan');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');

const app = express();
const mw = require('./middleware');
require('./middleware-wrapper');

/* We should ideally never land up having uncaught exceptions / rejections. */
process.on('unhandledRejection', (reason, p) => {
  require('./db').logError(reason, p, null, null, 'unhandledRejection');
  console.log('Unhandled Rejection at:', p, 'reason:', reason);

  // TODO: process.exit(); ?
});

process.on('uncaughtException', (err) => {
  require('./db').logError(err.message, err.stack, null, null, 'uncaughtException');
  console.log('Uncaught Exception', err);

  // TODO: process.exit(); ?
});

// add uuid to each request
const assignId = function (req, res, next) {
  req.id = uuid.v4();
  next();
};

app.use(assignId);

// setup logger
logger.token('id', function getId (req) {
  return req.id;
});

app.use(logger(':id :remote-addr :method :url :status :response-time'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(expressValidator());

app.use(mw.attachCurrentUserToRequest);

const router = express.Router();
router.use('', require('./routes/index'));
router.use('/account', require('./routes/account'));
app.use('/api', router);

/*
  TODO:
  * Fetch frontend routes array from (app/src/router/routes)
  and create route map for valid routes based on frontend.
  * For all other routes send 404 status code

  Is it necessary or the current system would work?
*/

const frontendStaticPath = require('path').join(__dirname, '..', 'app/dist');

app.use(express.static(frontendStaticPath));

app.get('/404', function (req, res) {
  res.status(404).send('Not found');
});

app.get('*', function (req, res) {
  res.sendFile(`${frontendStaticPath}/index.html`); // from the front end folder
});

app.use(function (error, req, res, next) {
  const query = error.query ? error.query.toString() : null;
  const code = error.code || null;
  const source = error.DB_ERROR ? 'DB_ERROR' : 'API_ERROR';

  require('./db').logError(error.message, error.stack, req.id, req.currentUser && req.currentUser.id, source, query, code);

  console.log(source, error);

  res.status(500).send('An error occured');
});

app.listen(config.get('PORT'));
console.log(`server listenging on port ${config.get('PORT')}`);
