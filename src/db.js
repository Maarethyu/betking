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

const getUserByEmail = async (email) => {
  const user = await db.oneOrNone('SELECT * FROM users WHERE lower(email) = lower($1)', email);
  return user;
};

const createUser = async (username, password, email, affiliateId) => {
  const result = await db.one('INSERT INTO users (username, password, email, affiliate_id) VALUES ($1, $2, $3, $4) RETURNING *', [username, password, email, affiliateId]);
  return result;
};

const createSession = async (userId, expires, ip, fingerprint) => {
  const result = await db.one('INSERT INTO sessions (id, user_id, expired_at, ip_address, fingerprint) VALUES ($1, $2, NOW() + $3::interval, $4, $5) RETURNING *', [uuidV4(), userId, expires, ip, fingerprint]);
  return result;
};

const logoutSession = async (userId, sessionId) => {
  await db.none('UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1 AND id = $2', [userId, sessionId]);
};

const logoutAllSessions = async (userId) => {
  await db.none('UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1', userId);
};

const logLoginAttempt = async (userId, isSuccess, ip, fingerprint, userAgent) => {
  const result = await db.one('INSERT INTO login_attempts (id, user_id, is_success, ip_address, fingerprint, user_agent) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [uuidV4(), userId, isSuccess, ip, fingerprint, userAgent]);
  return result;
};

const getConsecutiveFailedLogins = async (userId) => {
  const result = await db.one('select count(*) from login_attempts where created_at > NOW() - interval \'60 seconds\' AND is_success = false AND user_id = $1;', userId);
  return result.count;
};

const lockUserAccount = async (userId) => {
    await db.none('UPDATE users SET locked_at = NOW() WHERE id = $1', userId);
};

const updateEmail = async (userId, email) => {
  await db.none('UPDATE users set email = $2 WHERE id = $1', [userId, email]);
};

const updatePassword = async (userId, hash, currentSessionId) => {
  await db.tx(t => {
    return t.none('UPDATE users set password = $2 WHERE id = $1', [userId, hash])
      .then(() => {
        t.none('UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1 AND id != $2', [userId, currentSessionId]);
      });
  });
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
};

const insertTwoFactorCode = async (userId, code) => {
  await db.none('INSERT INTO mfa_passcodes (user_id, passcode) values ($1, $2)', [userId, code])
    .catch(e => {
      if (e.code === '23505') {
        throw new Error('CODE_ALREADY_USED');
      }

      throw e;
    });
};

const findLatestActiveResetToken = async (userId) => {
  const result = await db.oneOrNone('SELECT * from reset_tokens WHERE user_id = $1 AND expired_at > NOW() ORDER BY created_at DESC LIMIT 1', userId);
  return result;
};

const createResetToken = async (userId) => {
  const result = await db.one('INSERT INTO reset_tokens (id, user_id) VALUES ($1, $2) RETURNING *', [uuidV4(), userId]);
  return result;
};

const resetUserPasswordByToken = async (token, newPasswordHash) => {
  await db.tx(t => {
    // Set current reset token as used and expired. If token not found, exit
    return t.one('UPDATE reset_tokens SET used = true, expired_at = NOW() where id = $1 AND used = false AND expired_at > NOW() RETURNING user_id', token)
      // Change Password, return user
      .then(result => t.one('UPDATE users SET password = $1 WHERE id = $2 RETURNING *', [newPasswordHash, result.user_id]))
      // Password changed now. Expire all other reset password requests and logout all sessions
      .then(user => t.batch([
        t.none('UPDATE reset_tokens SET expired_at = NOW() WHERE user_id = $1 AND expired_at > NOW()', user.id),
        t.none('UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1', user.id)
      ]));
  });
};

const addIpInWhitelist = async (ipAddress, userId) => {
  await db.none('INSERT INTO whitelisted_ips (ip_address, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [ipAddress, userId]);
};

const removeIpFromWhitelist = async (ipAddress, userId) => {
  await db.none('DELETE FROM whitelisted_ips WHERE ip_address = $1 AND user_id = $2', [ipAddress, userId]);
};

const getWhitelistedIps = async (userId) => {
  const result = await db.any('SELECT * FROM whitelisted_ips WHERE user_id = $1', userId);
  return result;
};

const isIpWhitelisted = async (ip, userId) => {
  return db.task('check-whitelisted-ip', t => {
    // Check if there are any whitelisted ip Addresses added for user
    return t.one('SELECT COUNT(*) FROM whitelisted_ips WHERE user_id = $1', userId)
      .then(row => {
        // If user hasn't added any ips to whitelist, return true
        if (parseInt(row.count, 10) === 0) {
          return true;
        };
        // If count > 0, check if current ip is in whitelist
        return t.oneOrNone('SELECT ip_address FROM whitelisted_ips WHERE ip_address = $1 AND user_id = $2', [ip, userId]);
      })
      .then(result => !!result);
  });
};

module.exports.isEmailAlreadyTaken = isEmailAlreadyTaken;
module.exports.isUserNameAlreadyTaken = isUserNameAlreadyTaken;
module.exports.createUser = createUser;
module.exports.createSession = createSession;
module.exports.getUserByName = getUserByName;
module.exports.getUserByEmail = getUserByEmail;
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
module.exports.createResetToken = createResetToken;
module.exports.findLatestActiveResetToken = findLatestActiveResetToken;
module.exports.resetUserPasswordByToken = resetUserPasswordByToken;
module.exports.insertTwoFactorCode = insertTwoFactorCode;
module.exports.addIpInWhitelist = addIpInWhitelist;
module.exports.removeIpFromWhitelist = removeIpFromWhitelist;
module.exports.getWhitelistedIps = getWhitelistedIps;
module.exports.isIpWhitelisted = isIpWhitelisted;
module.exports.lockUserAccount = lockUserAccount;
