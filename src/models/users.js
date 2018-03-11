const uuidV4 = require('uuid/v4');

module.exports = (db) => {
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

  const getUserByEmail = async (email) => {
    const user = await db.oneOrNone('SELECT * FROM users WHERE lower(email) = lower($1)', email);
    return user;
  };

  const createUser = async (username, password, email, affiliateId, mfaKey) => {
    const result = await db.one('INSERT INTO users (username, password, email, affiliate_id, mfa_key) VALUES ($1, $2, $3, $4, $5) RETURNING *', [username, password, email, affiliateId, mfaKey]);
    return result;
  };

  const lockUserAccount = async (userId) => {
    await db.none('UPDATE users SET locked_at = NOW() WHERE id = $1', userId);
  };

  const updateEmail = async (userId, email) => {
    await db.tx(t => {
      return t.batch([
        t.none('UPDATE users set email = $2, email_verified = false WHERE id = $1', [userId, email]),
        t.none('UPDATE reset_tokens SET expired_at = NOW() WHERE user_id = $1 AND expired_at > NOW()', userId)
      ]);
    });
  };

  const updatePassword = async (userId, hash, currentSessionId) => {
    await db.tx(t => {
      return t.batch([
        t.none('UPDATE users set password = $2 WHERE id = $1', [userId, hash]),
        t.none('UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1 AND id != $2', [userId, currentSessionId])
      ]);
    });
  };

  const enableTwofactor = async (userId) => {
    await db.none('UPDATE users SET is_2fa_enabled = true WHERE id = $1', userId);
  };

  const disableTwoFactor = async (userId, newMfaKey) => {
    await db.none('UPDATE users SET mfa_key = $1, is_2fa_enabled = false WHERE id = $2', [newMfaKey, userId]);
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
      return t.oneOrNone('UPDATE reset_tokens SET used = true, expired_at = NOW() where id = $1 AND used = false AND expired_at > NOW() RETURNING user_id', token)
        .then(result => {
          if (!result) {
            throw new Error('INVALID_TOKEN');
          }

          return t.one('UPDATE users SET password = $1 WHERE id = $2 RETURNING *', [newPasswordHash, result.user_id]);
        })
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
    const {has_user_whitelisted_ip: hasUserWhitelistedIp} = await db.one('SELECT EXISTS(SELECT id from whitelisted_ips WHERE user_id = $1) AS has_user_whitelisted_ip', userId);

    if (!hasUserWhitelistedIp) {
      return true;
    }

    const {is_whitelisted: isWhitelisted} = await db.one('SELECT EXISTS(SELECT id from whitelisted_ips WHERE user_id = $1 AND ip_address = $2) AS is_whitelisted', [userId, ip]);

    return isWhitelisted;
  };

  const markEmailAsVerified = async (token) => {
    await db.tx(t => {
      return t.one('SELECT u.email, e.user_id FROM users AS u INNER JOIN verify_email_tokens AS e ON u.id = e.user_id WHERE e.id = $1', token)
        .then(res => t.batch([
          t.oneOrNone('UPDATE verify_email_tokens SET used = $1, expired_at = NOW() where id = $2 AND used = false AND expired_at > NOW() AND email = $3 RETURNING email', [true, token, res.email]),
          t.none('UPDATE users SET email_verified = $1 WHERE id = $2', [true, res.user_id]),
          t.none('UPDATE verify_email_tokens SET expired_at = NOW() WHERE user_id = $1 AND expired_at > NOW() AND id != $2', [res.user_id, token])
        ]))
        .then(res => {
          if (!res[0]) {
            throw new Error('INVALID_TOKEN');
          }
        });
    });
  };

  return {
    isEmailAlreadyTaken,
    isUserNameAlreadyTaken,
    getUserByName,
    getUserByEmail,
    createUser,
    lockUserAccount,
    updateEmail,
    updatePassword,
    enableTwofactor,
    disableTwoFactor,
    findLatestActiveResetToken,
    createResetToken,
    createVerifyEmailToken,
    resetUserPasswordByToken,
    addIpInWhitelist,
    removeIpFromWhitelist,
    getWhitelistedIps,
    isIpWhitelisted,
    markEmailAsVerified
  };
};
