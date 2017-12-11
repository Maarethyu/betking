const config = require('config');
const promise = require('bluebird'); 

const initOptions = {
  promiseLib: promise // overriding the default (ES6 Promise);
};

const pgp = require('pg-promise')(initOptions);

// Case-insensitive
const isEmailAlreadyTaken = async (email) => {
  const db = pgp(config.get('DB_CONNECTION_STRING'));
  const existingEmail = await db.oneOrNone('SELECT email FROM users WHERE lower(email) = lower($1)', email);
  // db.$pool.end(); // TODO correct?
  return existingEmail === 1;
};

// Case-insensitive
const isUserNameAlreadyTaken = async (username) => {
  const db = pgp(config.get('DB_CONNECTION_STRING'));
  const existingUserName = await db.oneOrNone('SELECT username FROM users WHERE lower(username) = lower($1)', username);
  // db.$pool.end; // TODO correct?
  return existingUserName === 1;
};

const createUser = async (username, password, email) => {
  const db = pgp(config.get('DB_CONNECTION_STRING'));
  const result = await db.one('INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *', [username, password, email]);
  // db.$pool.end; // TODO correct?
  return result;
};

module.exports.isEmailAlreadyTaken = isEmailAlreadyTaken; 
module.exports.isUserNameAlreadyTaken = isUserNameAlreadyTaken; 
module.exports.createUser = createUser;
