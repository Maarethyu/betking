const uuidV4 = require('uuid/v4');

module.exports = (db) => {
  const getAllCurrencies = async () => {
    const result = await db.any('SELECT * FROM currencies');
    return result;
  };

  const getAllBalancesForUser = async (userId) => {
    const result = await db.any('SELECT balance, currency from user_balances where user_id = $1', userId);
    return result;
  };

  const createWithdrawalEntry = async (userId, currency, withdrawalFee, amount, amountReceived, address, withdrawalStatus, verificationToken) => { // wallet
    await db.tx(t => {
      return t.oneOrNone('UPDATE user_balances SET balance = balance - $1 WHERE user_id = $2 AND currency = $3 AND balance >= $1 RETURNING balance', [amount, userId, currency])
        .then(res => {
          if (!res) {
            throw new Error('INSUFFICIENT_BALANCE');
          }

          return t.none('INSERT INTO user_withdrawals (id, user_id, currency, amount, fee, status, address, verification_token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [uuidV4(), userId, currency, amountReceived, withdrawalFee, withdrawalStatus, address, verificationToken]);
        });
    });
  };

  const confirmWithdrawByToken = async (token) => {
    await db.oneOrNone('UPDATE user_withdrawals SET status = $1, verified_at = NOW() WHERE verification_token = $2 AND status = $3 RETURNING *', ['pending', token, 'pending_email_verification'])
      .then(row => {
        if (!row) {
          throw new Error('INVALID_TOKEN');
        }
      });
  };

  const addDeposit = async (currencyToQuery, currency, amount, address, txid) => {
    const result = await db.tx(t => {
      return t.oneOrNone('SELECT user_id from user_addresses WHERE currency = $1 AND address = $2', [currencyToQuery, address])
        .then(row => {
          if (!row || !row.user_id) {
            throw new Error('USER_NOT_FOUND_FOR_ADDRESS');
          }

          const userId = row.user_id;

          // If tx already added, throw error
          return t.oneOrNone('SELECT COUNT(*) > 0 as tx_exists FROM user_deposits WHERE txid = $1 AND user_id = $2', [txid, userId])
            .then(row => {
              if (row && row.tx_exists) {
                throw new Error('TRANSACTION_EXISTS');
              }

              return userId;
            });
        })
        .then(userId => t.batch([
          t.one('INSERT INTO user_deposits (id, user_id, currency, amount, address, txid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [uuidV4(), userId, currency, amount, address, txid]),
          t.one('INSERT INTO user_balances (user_id, currency, balance) VALUES ($1, $2, $3) ON CONFLICT (user_id, currency) DO UPDATE SET balance = user_balances.balance + $3 RETURNING *', [userId, currency, amount])
        ]))
        .then(res => {
          if (res.length === 2) {
            return res[1];
          }
        });
    });

    return result;
  };

  const getDepositAddress = async (userId, currency) => {
    const result = await db.tx(t => {
      return t.oneOrNone('SELECT address FROM user_addresses WHERE user_id = $1 AND currency = $2', [userId, currency])
        .then(res => {
          if (res) {
            return res.address;
          }

          // Address not found in db. Find an available address
          return t.oneOrNone('SELECT id FROM user_addresses WHERE user_id IS NULL AND currency = $1 ORDER BY id LIMIT 1', currency)
            .then(res => {
              if (!res) {
                throw new Error('NO_DEPOSIT_ADDRESS_AVAILABLE');
              }

              // Assign the available address to current user (revalidate that the address is free) and return address
              return t.oneOrNone('UPDATE user_addresses SET user_id = $1 WHERE id = $2 AND user_id IS NULL RETURNING address', [userId, res.id]);
            })
            .then(res => {
              if (!res) {
                /* TODO: Race condition? No address was updated */
                return null;
              }

              return res.address;
            });
        });
    });

    return result;
  };

  const getPendingWithdrawals = async (userId, limit, skip, sort) => {
    const results = await db.any('SELECT * FROM user_withdrawals WHERE user_id = $1 AND status IN ($2, $3, $4) ORDER BY $5~ DESC LIMIT $6 OFFSET $7', [userId, 'pending', 'pending_email_verification', 'processing', sort, limit, skip]);
    const total = await db.one('SELECT COUNT(*) FROM user_withdrawals WHERE user_id = $1 AND status IN ($2, $3, $4)', [userId, 'pending', 'pending_email_verification', 'processing']);

    return {results, count: total.count};
  };

  const getWithdrawalHistory = async (userId, limit, skip, sort) => {
    const results = await db.any('SELECT * FROM user_withdrawals WHERE user_id = $1 AND status = $2 ORDER BY $3~ DESC LIMIT $4 OFFSET $5', [userId, 'processed', sort, limit, skip]);
    const total = await db.one('SELECT COUNT(*) FROM user_withdrawals WHERE user_id = $1 AND status = $2', [userId, 'processed']);

    return {results, count: total.count};
  };

  const getDepositHistory = async (userId, limit, skip, sort) => {
    const results = await db.any('SELECT * FROM user_deposits WHERE user_id = $1 ORDER BY $2~ DESC LIMIT $3 OFFSET $4', [userId, sort, limit, skip]);
    const total = await db.one('SELECT COUNT(*) FROM user_deposits WHERE user_id = $1', [userId, 'processed']);

    return {results, count: total.count};
  };

  const getWhitelistedAddresses = async (userId) => {
    const result = await db.any('SELECT * from whitelisted_addresses where user_id = $1', userId);
    return result;
  };

  const addWhitelistedAddress = async (userId, currency, address) => {
    await db.none('INSERT INTO whitelisted_addresses (user_id, currency, address) VALUES ($1, $2, $3)', [userId, currency, address])
      .catch(e => {
        if (e.code === '23505') {
          throw new Error('CURRENCY_ALREADY_WHITELISTED');
        }

        throw e;
      });
  };

  const removeWhitelistedAddress = async (userId, currency) => {
    await db.none('DELETE FROM whitelisted_addresses WHERE user_id = $1 AND currency = $2', [userId, currency]);
  };

  const isAddressWhitelisted = async (userId, currency, address) => {
    /* Return true if user has no whitelisted address entry OR if whitelisted address matches address, else false */
    const result = await db.oneOrNone('SELECT address = $1 as whitelisted FROM whitelisted_addresses WHERE user_id = $2 AND currency = $3', [address, userId, currency])
      .then(row => (!row || row.whitelisted));

    return result;
  };

  const sendTip = async (userId, username, amount, currency) => {
    await db.tx(t => {
      // Reduce balance from logged in user's account, throw error if insufficient balance.
      return t.oneOrNone('UPDATE user_balances SET balance = balance - $1 WHERE user_id = $2 AND currency = $3 AND balance >= $1 RETURNING balance', [amount, userId, currency])
        .then(res => {
          if (!res) {
            throw new Error('INSUFFICIENT_BALANCE');
          }

          return t.oneOrNone('SELECT id FROM users WHERE username = $1', [username])
            .then(res => {
              if (!res) {
                throw new Error('USERNAME_DOES_NOT_EXIST');
              }

              // Insert / Update balance for recepient user.
              return t.none('INSERT INTO user_balances (user_id, currency, balance) VALUES ($1, $2, $3) ON CONFLICT (user_id, currency) DO UPDATE SET balance = user_balances.balance + $3', [res.id, currency, amount]);
            });
        });
    });
  };

  const setConfirmWithdrawalByEmail = async (userId, confirmWithdrawal) => {
    await db.oneOrNone('UPDATE users SET confirm_withdrawal = $1 WHERE id = $2 AND email IS NOT NULL AND email_verified = true RETURNING *', [confirmWithdrawal, userId])
      .then(row => {
        if (!row) {
          throw new Error('VALID_USER_NOT_FOUND');
        }
      });
  };

  return {
    getAllCurrencies,
    getAllBalancesForUser,
    createWithdrawalEntry,
    confirmWithdrawByToken,
    addDeposit,
    getDepositAddress,
    getPendingWithdrawals,
    getWithdrawalHistory,
    getDepositHistory,
    getWhitelistedAddresses,
    addWhitelistedAddress,
    removeWhitelistedAddress,
    isAddressWhitelisted,
    sendTip,
    setConfirmWithdrawalByEmail
  };
};
