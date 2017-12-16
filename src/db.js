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

// Case-insensitive
const getUserByName = async (username) => {
  const user = await db.oneOrNone('SELECT * FROM users WHERE lower(username) = lower($1)', username);
  return user;
};

const getUserBySessionId = async (sessionId) => {
  const user = await db.oneOrNone('SELECT users.* FROM users JOIN active_sessions ON users.id = active_sessions.user_id WHERE active_sessions.id = $1 GROUP BY users.id', sessionId);
  return user;
};

const createUser = async (username, password, email) => {
  const result = await db.one('INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *', [username, password, email]);
  return result;
};

const createSession = async (userId, expires) => {
  const result = await db.one('INSERT INTO sessions (id, user_id, expired_at) VALUES ($1, $2, NOW() + $3::interval) RETURNING *', [uuidV4(), userId, expires]);
  return result;
};

const logoutSession = async (userId, sessionId) => {
  // validate userid and sessionid
  // what to return?
  const result = await db.one('UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1 AND id = $2', [userId, sessionId]);
  return result;
};

const logLoginAttempt = async (userId, isSuccess) => {
  const result = await db.one('INSERT INTO login_attempts (id, user_id, is_success) VALUES ($1, $2, $3) RETURNING *', [uuidV4(), userId, isSuccess]);
  return result;
};

module.exports.isEmailAlreadyTaken = isEmailAlreadyTaken; 
module.exports.isUserNameAlreadyTaken = isUserNameAlreadyTaken; 
module.exports.createUser = createUser;
module.exports.createSession = createSession;
module.exports.getUserByName = getUserByName;
module.exports.logLoginAttempt = logLoginAttempt;
module.exports.getUserBySessionId = getUserBySessionId;
