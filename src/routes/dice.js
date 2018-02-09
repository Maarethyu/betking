const express = require('express');
const BigNumber = require('bignumber.js');

const db = require('../db');
const mw = require('../middleware');
const helpers = require('../helpers');
const dice = require('../games/dice');

const router = express.Router();

router.use(mw.requireLoggedIn);
router.use(mw.requireWhitelistedIp);

router.get('/load-state', async function (req, res, next) {
  req.checkQuery('clientSeed', 'Invalid Client Seed')
    .exists()
    .isUUID(4);

  req.checkQuery('currency', 'Invalid currency')
    .exists()
    .isInt()
    .custom(value => require('./validators/currencyValidator')(value));

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return res.status(400).json({errors: validationResult.array()});
  }

  const diceSeed = await db.getActiveDiceSeed(req.currentUser.id, req.query.clientSeed);
  const latestUserBets = await db.getLatestUserDiceBets(req.currentUser.id, 'dice');
  const bankRoll = await db.getBankrollConfigForCurrency(req.query.currency);

  res.json({
    clientSeed: diceSeed.clientSeed,
    serverSeedHash: diceSeed.serverSeedHash,
    nonce: diceSeed.nonce,
    latestUserBets,
    maxWin: bankRoll.max_win,
    minBetAmount: bankRoll.min_bet_amount,
    isBettingDisabled: false
  });
});

router.post('/bet', async function (req, res, next) {
  /* Validations */

  /* 1. Validate fields */
  req.checkBody('currency', 'Invalid currency')
    .exists()
    .isInt()
    .custom(value => require('./validators/currencyValidator')(value));

  req.checkBody('target', 'Invalid target')
    .exists()
    .custom(value => {
      let isTargetValid = false;

      Object.keys(dice.targets).map(target => {
        if (dice.targets[target] === value) {
          isTargetValid = true;
        }
      });

      return isTargetValid;
    });

  req.checkBody('chance', 'Invalid chance')
    .exists()
    .isFloat({gt: 0.0001, lt: 98.99});

  req.checkBody('betAmount', 'Invalid bet amount')
    .custom(amount => require('./validators/amountValidator')(amount));

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    /* Only send first error message */
    const errors = validationResult.array();
    console.log(errors);
    const errorMsg = errors[0].msg;

    return res.status(400).json({error: errorMsg});
  }

  /* Basic validation done, now fetch bankroll to validate potential profit and minBetAmount */
  const bankRoll = await db.getBankrollConfigForCurrency(req.body.currency);

  const currency = parseInt(req.body.currency, 10);
  const betAmount = new BigNumber(req.body.betAmount);
  const minBetAmount = new BigNumber(bankRoll.min_bet_amount);
  const maxWin = new BigNumber(bankRoll.max_win);
  const chance = new BigNumber(req.body.chance);
  const multiplier = new BigNumber(99).dividedBy(chance);

  /* 2. Validate if bet amount is less than min bet amount */
  if (betAmount.lt(minBetAmount)) {
    const currencyName = helpers.getCurrencyField(currency, 'name');
    const minBetAmountFloat = minBetAmount.dividedBy(new BigNumber(10).pow(helpers.getCurrencyField(currency, 'scale')));
    return res.status(400).json({error: `Min bet amount for ${currencyName} is ${minBetAmountFloat}`});
  }

  /* 3. Calculate potential profit, validate if it is > 0.00000001 and less than maxWin */
  const potentialProfit = betAmount.times(multiplier).minus(betAmount);

  // TODO: Get potential profit per currency from bankroll table too?
  if (potentialProfit.lt(0.00000001)) {
    return res.status(400).json({error: 'Min profit too low'});
  }

  if (potentialProfit.gt(maxWin)) {
    return res.status(400).json({error: 'Profit greater than max'});
  }

  /* 4. TODO: Validate if customer allowed */

  /* DICE ROLL CALCULATION AND DICE BET */
  try {
    const result = await db.doDiceBet(
      req.currentUser.id,
      betAmount.toString(),
      currency,
      req.body.target,
      chance.toNumber()
    );

    res.json(result);
  } catch (e) {
    if (e.message === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({error: 'Balance too low'});
    }

    throw e;
  }
});

module.exports = router;
