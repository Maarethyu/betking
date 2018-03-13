const config = require('config');
const promise = require('bluebird');

const initOptions = {
  promiseLib: promise, // overriding the default (ES6 Promise);
  error (error, e) {
    error.DB_ERROR = true;
  }
};

const pgp = require('pg-promise')(initOptions);
const db = pgp(config.get('DB_CONNECTION_STRING'));

module.exports = {
  affiliate: require('./models/affiliate')(db),
  chat: require('./models/chat')(db),
  diceGame: require('./models/diceGame')(db),
  logs: require('./models/logs')(db),
  sessions: require('./models/sessions')(db),
  support: require('./models/support')(db),
  users: require('./models/users')(db),
  wallet: require('./models/wallet')(db),
  bets: require('./models/bets')(db),
  cubeia: require('./models/cubeia')(db)
};
