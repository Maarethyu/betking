const path = require('path');
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
const InMemoryCache = require('./cache/InMemoryCache');
const startSocketServer = require('./socket/startSocketServer');
const {eventEmitter} = require('./eventEmitter');

// We should never have uncaught exceptions or rejections.
// TODO - should these be before express is created?
// TODO - Moved express creation inside startServer function
process.on('unhandledRejection', (reason, promise) => {
  db.logs.logUnhandledRejectionError(reason, promise);
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  db.logs.logUncaughtExceptionError(err.message, err.stack);
  console.log('Uncaught Exception', err);
});

const cache = new InMemoryCache(db);

const startHttpServer = function () {
  const app = express();
  require('./middleware-wrapper');

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
  router.use('/account', csrfProtection, require('./routes/account')(cache.currencyCache));
  router.use('/admin', require('./routes/admin')(cache.currencyCache));
  router.use('/auth', require('./routes/auth')());
  router.use('/dice', require('./routes/dice')(cache.currencyCache));
  router.use('/stats', require('./routes/stats')(cache.statsCache, cache.exchangeRateCache));
  router.use('/sessions', require('./routes/sessions')());
  router.use('/wallet', require('./routes/wallet')(cache.currencyCache, cache.recommendedBitcoinTxnFeeCache));
  router.use('/bets', require('./routes/bets')());
  router.use('/chat', require('./routes/chat')());
  router.use('/support', require('./routes/support')());
  router.use('/affiliate', require('./routes/affiliate')());
  router.use('/cubeia', require('./routes/cubeia')(cache.currencyCache));
  app.use('/api', router);

  app.use('/poker', require('./routes/poker')());

  // TODO - review
  const frontendStaticPath = path.join(__dirname, '..', 'app/dist');

  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    app.use('/static', express.static(`${frontendStaticPath}/static`));
  }

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    require(path.join(__dirname, '..', 'app/build/express-server'))(app);
  } else {
    app.get('*', csrfProtection, function (req, res) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      fs.createReadStream(`${frontendStaticPath}/index.html`)
        .pipe(helpers.addConfigVariables(req.csrfToken()))
        .pipe(res);
    });
  }

  app.use(function (error, req, res, next) {
    if (error.code === 'EBADCSRFTOKEN' && !res.headersSent) {
      return res.status(403).send('Invalid request token');
    }

    if (error.name === 'ValidationError' && !res.headersSent) {
      return res.status(error.code).json(error.response);
    }

    const query = error.query ? error.query.toString() : null;
    const code = error.code || null;
    const source = error.DB_ERROR ? 'DB_ERROR' : 'API_ERROR';

    db.logs.logError(error.message, error.stack, req.id, req.currentUser && req.currentUser.id, source, query, code);

    console.log(source, error);

    if (!res.headersSent) {
      res.status(500).send('An error occured');
    }
  });

  const server = app.listen(config.get('PORT'));
  console.log(`server listening on port ${config.get('PORT')}`);

  return server;
};

cache.load()
  .then(() => {
    const server = startHttpServer();
    startSocketServer(server, cache);

    eventEmitter.addListener((event) => {
      cache.handle(event);
    });
  });
