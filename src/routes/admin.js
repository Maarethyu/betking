const express = require('express');
const db = require('../db');
const mw = require('../middleware');

const router = express.Router();

router.use(mw.requireAdminSecret);

router.post('/deposit-confirmed', async function (req, res, next) {
  req.checkBody('txid', 'Invalid transaction id').exists();

  req.checkBody('amount', 'Invalid amount').exists()
    .custom(amount => require('./validators/amountValidator')(amount));

  req.checkBody('currency', 'Invalid currency')
    .exists()
    .isInt()
    .custom(currency => require('./validators/currencyValidator')(currency));

  req.checkBody('address', 'Invalid address')
    .exists()
    .custom(address => require('./validators/addressValidator')(address, req.body.currency));

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return res.status(400).json({errors: validationResult.array()});
  }

  try {
    await db.addDeposit(
      parseInt(req.body.currency, 10),
      req.body.amount,
      req.body.address,
      req.body.txid
    );

    res.end();
  } catch (e) {
    if (e.message === 'USER_NOT_FOUND_FOR_ADDRESS' || e.message === 'TRANSACTION_EXISTS') {
      return res.status(400).json({error: e.message});
    }

    throw e;
  }
});

module.exports = router;
