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
  return !!existingEmail;
};

// Case-insensitive
const isUserNameAlreadyTaken = async (username) => {
  const existingUserName = await db.oneOrNone('SELECT username FROM users WHERE lower(username) = lower($1)', username);
  return !!existingUserName;
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
  await db.none('UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1 AND id = $2', [userId, sessionId]);
};

const logoutAllSessions = async (userId) => {
  await db.none('UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1', userId);
};

const logLoginAttempt = async (userId, isSuccess) => {
  const result = await db.one('INSERT INTO login_attempts (id, user_id, is_success) VALUES ($1, $2, $3) RETURNING *', [uuidV4(), userId, isSuccess]);
  return result;
};

const getConsecutiveFailedLogins = async (userId) => {
  const result = await db.one('select count(*) from login_attempts where created_at > NOW() - interval \'60 seconds\' AND is_success = false AND user_id = $1;', userId);
  return result.count;
};

const updateEmail = async (userId, email) => {
  await db.none('UPDATE users set email = $2 WHERE id = $1', [userId, email]);
};

const updatePassword = async (userId, hash) => {
  await db.none('UPDATE users set password = $2 WHERE id = $1', [userId, hash]);
};

const getActiveSessions = async (userId) => {
  const result = await db.any('SELECT * FROM active_sessions WHERE user_id = $1', userId);
  return result;
};

const addTemp2faSecret = async (userId, tempSecret) => {
  const result = await db.one('UPDATE users set temp_mfa_key = $1 where id = $2 returning temp_mfa_key', [tempSecret, userId]);
  return result;
};

const enableTwofactor = async (userId) => {
  await db.none('UPDATE users set mfa_key = temp_mfa_key, temp_mfa_key = NULL where id = $1', userId);
};

const disableTwoFactor = async (userId) => {
  await db.none('UPDATE users set mfa_key = NULL, temp_mfa_key = NULL where id = $1', userId);
}

module.exports.isEmailAlreadyTaken = isEmailAlreadyTaken;
module.exports.isUserNameAlreadyTaken = isUserNameAlreadyTaken;
module.exports.createUser = createUser;
module.exports.createSession = createSession;
module.exports.getUserByName = getUserByName;
module.exports.logLoginAttempt = logLoginAttempt;
module.exports.getConsecutiveFailedLogins = getConsecutiveFailedLogins;
module.exports.getUserBySessionId = getUserBySessionId;
module.exports.logoutSession = logoutSession;
module.exports.updateEmail = updateEmail;
module.exports.updatePassword = updatePassword;
module.exports.getActiveSessions = getActiveSessions;
module.exports.logoutAllSessions = logoutAllSessions;
module.exports.addTemp2faSecret = addTemp2faSecret;
module.exports.enableTwofactor = enableTwofactor;
module.exports.disableTwoFactor = disableTwoFactor;
