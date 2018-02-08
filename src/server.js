const config = require('config');
const express = require('express');
const logger = require('morgan');
const uuid = require('uuid');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const fs = require('fs');
const csrfProtection = require('csurf')({cookie: true});
const db = require('./db');
const helpers = require('./helpers');
const mw = require('./middleware');

const app = express();
require('./middleware-wrapper');

/* We should ideally never land up having uncaught exceptions / rejections. */
process.on('unhandledRejection', (reason, p) => {
  db.logError(reason, p, null, null, 'unhandledRejection');
  console.log('Unhandled Rejection at:', p, 'reason:', reason);

  // TODO: process.exit(); ?
});

process.on('uncaughtException', (err) => {
  db.logError(err.message, err.stack, null, null, 'uncaughtException');
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

app.use(helmet({frameguard: {action: 'deny'}}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(expressValidator());

app.use(mw.attachCurrentUserToRequest);

const router = express.Router();
router.use('/account', csrfProtection, require('./routes/account'));
router.use('/admin', require('./routes/admin'));
router.use('', csrfProtection, require('./routes/index'));
app.use('/api', router);

const frontendStaticPath = require('path').join(__dirname, '..', 'app/dist');

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
  app.use('/static', express.static(`${frontendStaticPath}/static`));
}

app.get('/404', function (req, res) {
  res.status(404).send('Not found');
});

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  require(require('path').join(__dirname, '..', 'app/build/express-server'))(app);
} else {
  app.get('*', csrfProtection, function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    fs.createReadStream(`${frontendStaticPath}/index.html`)
      .pipe(helpers.addCsrfToken(req.csrfToken()))
      .pipe(res);
  });
}

app.use(function (error, req, res, next) {
  if (error.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('csrf protection failed');
  }
  
  const query = error.query ? error.query.toString() : null;
  const code = error.code || null;
  const source = error.DB_ERROR ? 'DB_ERROR' : 'API_ERROR';

  db.logError(error.message, error.stack, req.id, req.currentUser && req.currentUser.id, source, query, code);

  console.log(source, error);

  res.status(500).send('An error occured');
});

app.listen(config.get('PORT'));
console.log(`server listening on port ${config.get('PORT')}`);
