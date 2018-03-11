const express = require('express');
const db = require('../db');
const mw = require('../middleware');
const helpers = require('../helpers');
const {notificationEmitter, types} = require('../socket/notificationEmitter');

module.exports = (currencyCache) => {
  const router = express.Router();

  router.use(mw.requireAdminSecret);

  router.post('/deposit-confirmed', async function (req, res, next) {
    req.checkBody('txid', 'Invalid transaction id').exists();

    req.checkBody('amount', 'Invalid amount').exists()
      .custom(amount => require('./validators/amountValidator')(amount));

    req.checkBody('currency', 'Invalid currency')
      .exists()
      .isInt()
      .custom(currency => !!currencyCache.findById(currency));

    const currencyConfig = currencyCache.findById(req.body.currency);

    req.checkBody('address', 'Invalid address')
      .exists()
      .custom(address => require('./validators/addressValidator')(address, currencyConfig));

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    const currency = parseInt(req.body.currency, 10);
    const currencyToQuery = helpers.getCurrencyToQueryFromAddressTable(currencyCache, currency);

    try {
      const newUserBalance = await db.wallet.addDeposit(
        currencyToQuery,
        currency,
        req.body.amount,
        req.body.address,
        req.body.txid
      );

      notificationEmitter.emit(types.DEPOSIT_CONFIRMED, {
        userId: newUserBalance.user_id,
        currency: newUserBalance.currency,
        amount: req.body.amount,
        balance: newUserBalance.balance
      });

      res.end();
    } catch (e) {
      if (e.message === 'USER_NOT_FOUND_FOR_ADDRESS' || e.message === 'TRANSACTION_EXISTS') {
        return res.status(400).json({error: e.message});
      }

      throw e;
    }
  });

  return router;
};
