const config = require('config');
const promise = require('bluebird');
const uuidV4 = require('uuid/v4');

const initOptions = {
  promiseLib: promise, // overriding the default (ES6 Promise);
  error (error, e) {
    error.DB_ERROR = true;
  }
};

const pgp = require('pg-promise')(initOptions);
const db = pgp(config.get('DB_CONNECTION_STRING'));

/* USER ACCOUNT */

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

const log2faAttempt = async (userId, isSuccess, ip, fingerprint, userAgent) => {
  const result = await db.one('INSERT INTO mfa_attempts (user_id, is_success, ip_address, fingerprint, user_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *', [userId, isSuccess, ip, fingerprint, userAgent]);
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
  await db.tx(t => {
    return t.batch([
      /* Change email */
      t.none('UPDATE users set email = $2, email_verified = false WHERE id = $1', [userId, email]),
      /* Mark all previous reset password tokens as expired */
      t.none('UPDATE reset_tokens SET expired_at = NOW() WHERE user_id = $1 AND expired_at > NOW()', userId)
    ]);
  });
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

const createVerifyEmailToken = async (userId, email) => {
  const result = await db.one('INSERT INTO verify_email_tokens (id, user_id, email) VALUES ($1, $2, $3) RETURNING *', [uuidV4(), userId, email]);
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

const logError = async (msg, stack, reqId, userId, source, query, code) => {
  await db.none('INSERT INTO error_logs (msg, stack, req_id, user_id, source, db_query, db_code) VALUES ($1, $2, $3, $4, $5, $6, $7)', [msg, stack, reqId, userId, source, query, code])
    .catch(error => {
      // Do not throw error from here to prevent infinite loop
      console.log('Error writing to error logs', error);
    });
};

const logEmailError = async (msg, stack, toEmail, info) => {
  await db.none('INSERT INTO error_logs (msg, stack, to_email, mail_info, source) VALUES ($1, $2, $3, $4, $5)', [msg, stack, toEmail, info, 'MAIL_ERROR'])
    .catch(error => {
      // Do not throw error from here to prevent infinite loop
      console.log('Error writing to error logs', error);
    });
};

const getLoginAttempts = async (userId) => {
  const results = await db.any('SELECT * FROM login_attempts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', userId);
  return results;
};

const markEmailAsVerified = async (token) => {
  await db.tx(t => {
    // Return current email from users table
    return t.one('SELECT u.email, e.user_id FROM users AS u INNER JOIN verify_email_tokens AS e ON u.id = e.user_id WHERE e.id = $1', token)
      // Set current verify-email token as used and expired. If token not found, exit
      .then(res => t.batch([
        // Expire the current token, mark it as used
        t.one('UPDATE verify_email_tokens SET used = $1, expired_at = NOW() where id = $2 AND used = false AND expired_at > NOW() AND email = $3 RETURNING email', [true, token, res.email]),

        // Verify user's email id
        t.none('UPDATE users SET email_verified = $1 WHERE id = $2', [true, res.user_id]),

        // Expire all other verify email tokens
        t.none('UPDATE verify_email_tokens SET expired_at = NOW() WHERE user_id = $1 AND expired_at > NOW() AND id != $2', [res.user_id, token])
      ]));
  });
};

/* CRYPTO */
const getAllBalancesForUser = async (userId) => {
  const result = await db.any('SELECT balance, currency from user_balances where user_id = $1', userId);
  return result;
};

const createWithdrawalEntry = async (userId, currency, wdFee, amount, address, totalFee) => {
  await db.tx(t => {
    /* Check if user has sufficient balance in the account */
    return t.one('SELECT balance from user_balances where user_id = $1 AND currency = $2', [userId, currency])
      .then(res => {
        if (wdFee.plus(amount).gt(res.balance)) {
          throw new Error('INSUFFICIENT_BALANCE');
        }
        return t.batch([
          t.none('INSERT INTO user_withdrawal (id, user_id, currency, amount, status, address) VALUES ($1, $2, $3, $4, $5, $6)', [uuidV4(), userId, currency, amount, 'pending', address]), 
          t.none('UPDATE user_balances SET balance = balance - $1 WHERE user_id = $2 AND currency = $3', [totalFee, userId, currency])
        ]);
      });
  });
};

module.exports.isEmailAlreadyTaken = isEmailAlreadyTaken;
module.exports.isUserNameAlreadyTaken = isUserNameAlreadyTaken;
module.exports.createUser = createUser;
module.exports.createSession = createSession;
module.exports.getUserByName = getUserByName;
module.exports.getUserByEmail = getUserByEmail;
module.exports.logLoginAttempt = logLoginAttempt;
module.exports.log2faAttempt = log2faAttempt;
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
module.exports.logError = logError;
module.exports.logEmailError = logEmailError;
module.exports.getLoginAttempts = getLoginAttempts;
module.exports.createVerifyEmailToken = createVerifyEmailToken;
module.exports.markEmailAsVerified = markEmailAsVerified;
/* CRYPTO */
module.exports.getAllBalancesForUser = getAllBalancesForUser;
module.exports.createWithdrawalEntry = createWithdrawalEntry;
