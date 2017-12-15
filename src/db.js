const config = require('config');
const promise = require('bluebird'); 
const uuidV4 = require('uuid/v4');

const initOptions = {
  promiseLib: promise // overriding the default (ES6 Promise);
};

const pgp = require('pg-promise')(initOptions);
const db = pgp(config.get('DB_CONNECTION_STRING'));
// Case-insensitive
const isEmailAlreadyTaken = async (email) => {
  const existingEmail = await db.oneOrNone('SELECT email FROM users WHERE lower(email) = lower($1)', email);
  return existingEmail === 1;
};

// Case-insensitive
const isUserNameAlreadyTaken = async (username) => {
  const existingUserName = await db.oneOrNone('SELECT username FROM users WHERE lower(username) = lower($1)', username);
  return existingUserName === 1;
};

const createUser = async (username, password, email) => {
  const result = await db.one('INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *', [username, password, email]);
  return result;
};

const createSession = async (userId, expires) => {
  const result = await db.one('INSERT INTO sessions (user_id, id, expired_at) VALUES ($1, $2, NOW() + $3::interval) RETURNING *', [userId, uuidV4(), expires]);
  return result;
};

module.exports.isEmailAlreadyTaken = isEmailAlreadyTaken; 
module.exports.isUserNameAlreadyTaken = isUserNameAlreadyTaken; 
module.exports.createUser = createUser;
module.exports.createSession = createSession;
