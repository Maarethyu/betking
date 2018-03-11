const uuidV4 = require('uuid/v4');

module.exports = (db) => {
  const logLoginAttempt = async (userId, isSuccess, ip, fingerprint, userAgent) => {
    const result = await db.one('INSERT INTO login_attempts (id, user_id, is_success, ip_address, fingerprint, user_agent) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [uuidV4(), userId, isSuccess, ip, fingerprint, userAgent]);
    return result;
  };

  const log2faAttempt = async (userId, isSuccess, ip, fingerprint, userAgent) => {
    const result = await db.one('INSERT INTO mfa_attempts (user_id, is_success, ip_address, fingerprint, user_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *', [userId, isSuccess, ip, fingerprint, userAgent]);
    return result;
  };

  const getConsecutiveFailedLoginAttempts = async (userId) => {
    const result = await db.one('select count(*) from login_attempts where created_at > NOW() - interval \'60 seconds\' AND is_success = false AND user_id = $1;', userId);
    return result.count;
  };

  const saveUsedTwoFactorCode = async (userId, code) => {
    await db.none('INSERT INTO mfa_passcodes (user_id, passcode) values ($1, $2)', [userId, code])
      .catch(e => {
        if (e.code === '23505') {
          throw new Error('CODE_ALREADY_USED');
        }

        throw e;
      });
  };

  const logError = async (msg, stack, reqId, userId, source, query, code) => {
    await db.none('INSERT INTO error_logs (msg, stack, req_id, user_id, source, db_query, db_code) VALUES ($1, $2, $3, $4, $5, $6, $7)', [msg, stack, reqId, userId, source, query, code])
      .catch(error => {
        // Do not throw error from here to prevent infinite loop
        console.log('Error writing to error logs', error);
      });
  };

  const logUnhandledRejectionError = async (msg, stack) => {
    await db.none('INSERT INTO error_logs (msg, stack, req_id, user_id, source, db_query, db_code) VALUES ($1, $2, $3, $4, $5, $6, $7)', [msg, stack, null, null, 'unhandledRejection', null, null])
      .catch(error => {
        // Do not throw error from here to prevent infinite loop
        console.log('Error writing to error logs', error);
      });
  };

  const logUncaughtExceptionError = async (msg, stack) => {
    await db.none('INSERT INTO error_logs (msg, stack, req_id, user_id, source, db_query, db_code) VALUES ($1, $2, $3, $4, $5, $6, $7)', [msg, stack, null, null, 'uncaughtException', null, null])
      .catch(error => {
        // Do not throw error from here to prevent infinite loop
        console.log('Error writing to error logs', error);
      });
  };

  const logEmailError = async (msg, stack, address, info) => {
    await db.none('INSERT INTO error_logs (msg, stack, to_email, mail_info, source) VALUES ($1, $2, $3, $4, $5)', [msg, stack, address, info, 'MAIL_ERROR'])
      .catch(error => {
        // Do not throw error from here to prevent infinite loop
        console.log('Error writing to error logs', error);
      });
  };

  const logNoDepositAddressAvailableError = async (msg, stack, reqId, userId, currency) => {
    await db.none('INSERT INTO error_logs (msg, stack, req_id, user_id, source, currency) VALUES ($1, $2, $3, $4, $5, $6)', [msg, stack, reqId, userId, 'ADDRESS_ERROR', currency])
      .catch(error => {
        // Do not throw error from here to prevent infinite loop
        console.log('Error writing to error logs', error);
      });
  };

  const getLoginAttempts = async (userId) => {
    const results = await db.any('SELECT * FROM login_attempts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', userId);
    return results;
  };

  return {
    logLoginAttempt,
    log2faAttempt,
    getConsecutiveFailedLoginAttempts,
    saveUsedTwoFactorCode,
    logError,
    logUnhandledRejectionError,
    logUncaughtExceptionError,
    logEmailError,
    logNoDepositAddressAvailableError,
    getLoginAttempts
  };
};
