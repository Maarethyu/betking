const express = require('express');
const BigNumber = require('bignumber.js');
const uuidV4 = require('uuid/v4');
const db = require('../db');
const helpers = require('../helpers');
const mw = require('../middleware');
const mailer = require('../mailer');

const {
  validateDepositAddress,
  validateWithdraw,
  validateSetConfirmWithdrawByEmail,
  validateWalletTransactions,
  validateAddWhitelistedAddress,
  validateRemoveWhitelistedAddress,
  validateConfirmWithdraw,
  validateSendTip
} = require('./validators/walletValidators');

const getWalletTransactions = (dbQuery) => async (req) => {
  await validateWalletTransactions(req);

  const {results, count} = await dbQuery(req.currentUser.id, req.query.limit || 10, req.query.skip || 0, req.query.sort || 'created_at');

  return {results, count};
};

const sendWalletTransactions = (dbQuery) => async (req, res, next) => {
  const result = await getWalletTransactions(dbQuery)(req);

  if (result.errors) {
    return res.status(400).json({errors: result.errors});
  }

  res.json(result);
};

module.exports = (currencyCache, txnFeeCache) => {
  const router = express.Router();

  router.use(mw.requireLoggedIn);
  router.use(mw.requireWhitelistedIp);

  router.get('/currencies', async function (req, res, next) {
    const currencies = currencyCache.currencies;

    res.json({currencies});
  });

  router.post('/confirm-withdraw', async function (req, res, next) {
    await validateConfirmWithdraw(req);

    try {
      await db.confirmWithdrawByToken(req.body.token);

      res.end();
    } catch (e) {
      if (e.message === 'INVALID_TOKEN') {
        return res.status(400).json({error: e.message});
      }

      throw e;
    }
  });

  router.get('/recommended-btc-txn-fee', async function (req, res, next) {
    try {
      const recommendedFee = await txnFeeCache.fetchRecommendedBitcoinTxnFee();
      return res.json({recommendedFee});
    } catch (e) {
      return res.status(400).json({error: 'Could not fetch recommended transaction fee'});
    }
  });

  router.get('/balances', mw.requireLoggedIn, mw.requireWhitelistedIp, async function (req, res, next) {
    // TODO: Do we need pagination for this api? It is always going to send limited amount of data
    const balances = await db.getAllBalancesForUser(req.currentUser.id);

    res.json({balances});
  });

  router.get('/deposit-address', mw.requireLoggedIn, mw.requireWhitelistedIp, mw.allowCustomerByCountry, async function (req, res, next) {
    await validateDepositAddress(req, currencyCache);

    const currency = parseInt(req.query.currency, 10);
    const currencyToQuery = helpers.getCurrencyToQueryFromAddressTable(currencyCache, currency);
    try {
      const address = await db.getDepositAddress(req.currentUser.id, currencyToQuery);
      const addressQr = await helpers.getAddressQr(address);
      res.json({address, addressQr});
    } catch (e) {
      if (e.message === 'NO_DEPOSIT_ADDRESS_AVAILABLE') {
        await db.logNoDepositAddressAvailableError(e.message, e.stack, req.id, req.currentUser && req.currentUser.id, req.query.currency);
        return res.status(400).send({error: 'NO_DEPOSIT_ADDRESS_AVAILABLE'});
      }

      throw e;
    }
  });

  // TODO: Add isCustomerAllowed middleware (check for CF-IPCountry ?)
  router.post('/withdraw', mw.requireLoggedIn, mw.requireWhitelistedIp, mw.require2fa, async function (req, res, next) {
    await validateWithdraw(req, currencyCache);

    if (req.currentUser.confirm_withdrawal && (!req.currentUser.email || !req.currentUser.email_verified)) {
      return res.status(400).json({error: 'You have asked to confirm withdrawals by email but you do not have a verified email id added to profile'});
    }

    const currency = currencyCache.findById(req.body.currency);

    if (new BigNumber(currency.min_withdraw_limit).gt(new BigNumber(req.body.amount))) {
      return res.status(400).json({error: 'Requested amount is less than minimum withdrawal limit'});
    }

    const isAddressWhitelisted = await db.isAddressWhitelisted(req.currentUser.id, req.body.currency, req.body.address);
    if (!isAddressWhitelisted) {
      return res.status(400).json({error: 'Cannot withdraw to a non-whitelisted address'});
    }

    const withdrawalFeePerByte = req.body.withdrawalFeePerByte || 0;

    const withdrawalFee = parseInt(req.body.currency, 10) === 0
      ? new BigNumber(withdrawalFeePerByte * 226).toString()
      : new BigNumber(currency.withdrawal_fee).toString();

    const withdrawalStatus = req.currentUser.confirm_withdrawal ? 'pending_email_verification' : 'pending';
    const verificationToken = req.currentUser.confirm_withdrawal ? uuidV4() : null;
    const amountReceived = new BigNumber(req.body.amount)
      .minus(withdrawalFee)
      .toString();

    try {
      await db.createWithdrawalEntry(
        req.currentUser.id,
        req.body.currency,
        withdrawalFee,
        req.body.amount,
        amountReceived,
        req.body.address,
        withdrawalStatus,
        verificationToken
      );

      if (withdrawalStatus === 'pending_email_verification') {
        mailer.sendWithdrawConfirmationEmail(
          req.currentUser.username,
          req.currentUser.email,
          verificationToken,
          currency.symbol,
          new BigNumber(amountReceived).div(new BigNumber(10).pow(currency.scale)),
          req.body.address
        );
      }

      res.end();
    } catch (e) {
      if (e.message === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json({error: 'Insufficient balance'});
      }

      throw e;
    }
  });

  router.post('/set-confirm-withdraw-by-email', mw.requireLoggedIn, mw.requireWhitelistedIp,
    async function (req, res, next) {
      await validateSetConfirmWithdrawByEmail(req);

      if (!req.body.option) {
        mw.require2fa(req, res, next);
      } else {
        next();
      }
    },
    async function (req, res, next) {
      try {
        await db.setConfirmWithdrawalByEmail(req.currentUser.id, req.body.option);

        res.end();
      } catch (e) {
        if (e.message === 'VALID_USER_NOT_FOUND') {
          return res.status(400).send({error: e.message});
        }

        throw e;
      }
    }
  );

  router.get('/wallet-info', mw.requireLoggedIn, mw.requireWhitelistedIp, async function (req, res, next) {
    // TODO: Get pending deposits from db
    res.json({
      pendingWithdrawals: await getWalletTransactions(db.getPendingWithdrawals)(req, res, next),
      withdrawalHistory: await getWalletTransactions(db.getWithdrawalHistory)(req, res, next),
      depositHistory: await getWalletTransactions(db.getDepositHistory)(req, res, next),
      pendingDeposits: {},
      whitelistedAddresses: await db.getWhitelistedAddresses(req.currentUser.id)
    });
  });

  router.get('/pending-withdrawals', mw.requireLoggedIn, mw.requireWhitelistedIp, sendWalletTransactions(db.getPendingWithdrawals));

  router.get('/withdrawal-history', mw.requireLoggedIn, mw.requireWhitelistedIp, sendWalletTransactions(db.getWithdrawalHistory));

  router.get('/deposit-history', mw.requireLoggedIn, mw.requireWhitelistedIp, sendWalletTransactions(db.getDepositHistory));

  router.get('/whitelisted-address', mw.requireLoggedIn, mw.requireWhitelistedIp, async function (req, res, next) {
    const whitelistedAddresses = await db.getWhitelistedAddresses(req.currentUser.id);

    res.json({whitelistedAddresses});
  });

  router.post('/whitelisted-address/add', mw.requireLoggedIn, mw.requireWhitelistedIp, mw.require2fa, async function (req, res, next) {
    await validateAddWhitelistedAddress(req, currencyCache);

    try {
      await db.addWhitelistedAddress(
        req.currentUser.id,
        parseInt(req.body.currency, 10),
        req.body.address
      );

      res.end();
    } catch (e) {
      if (e.message === 'CURRENCY_ALREADY_WHITELISTED') {
        return res.status(400).json({error: e.message});
      }

      throw e;
    }
  });

  router.post('/whitelisted-address/remove', mw.requireLoggedIn, mw.requireWhitelistedIp, mw.require2fa, async function (req, res, next) {
    await validateRemoveWhitelistedAddress(req, currencyCache);

    await db.removeWhitelistedAddress(
      req.currentUser.id,
      parseInt(req.body.currency, 10)
    );

    res.end();
  });

  router.post('/send-tip', async function (req, res, next) {
    await validateSendTip(req, currencyCache);

    const currency = currencyCache.findById(req.body.currency);

    if (new BigNumber(currency.min_withdraw_limit).gt(new BigNumber(req.body.amount))) {
      return res.status(400).json({error: 'Requested amount is less than minimum tip limit'});
    }

    try {
      await db.sendTip(req.currentUser.id, req.body.username, req.body.amount, req.body.currency);
    } catch (e) {
      if (e.message === 'INSUFFICIENT_BALANCE' || e.message === 'USERNAME_DOES_NOT_EXIST') {
        return res.status(400).json({error: e.message});
      }
      throw e;
    }

    res.end();
  });

  return router;
};
