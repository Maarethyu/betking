const config = require('config');
const express = require('express');
const logger = require('morgan');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const app = express();
const mw = require('./middleware');

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

app.use('/client', require('./client'));

/* the front end code is in another repository and developed independantly 
  we serve the built front end code from here
  this allows developers to work on front end code without the security risk of them having access to how
  the backend works.
  It also allows us to have register/login code separate from front end while not worrying about different domains
  TODO - is this a bad way to do this?
*/

/*
  TODO: 
  * Fetch frontend routes array from (app/src/router/routes)
  and create route map for valid routes based on frontend.
  * For all other routes send 404 status code

  Is it necessary or the current system would work?
*/

const frontendStaticPath = require('path').join(__dirname, '..', 'app/dist/static');

app.use(express.static(frontendStaticPath));

app.get('/404', function (req, res) {
  res.status(404).send('Not found');
});

app.get('*', function (req, res) {
  res.sendFile(`${frontendStaticPath}/index.html`); // from the front end folder
});

app.listen(config.get('PORT'));
console.log(`server listenging on port ${config.get('PORT')}`);
