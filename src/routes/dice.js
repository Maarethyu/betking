const express = require('express');
const BigNumber = require('bignumber.js');
const db = require('../db');
const mw = require('../middleware');
const dice = require('../games/dice');
const {eventEmitter, types} = require('../eventEmitter');

module.exports = (currencyCache) => {
  const router = express.Router();

  router.get('/load-state', async function (req, res, next) {
    if (req.currentUser) {
      mw.requireWhitelistedIp(req, res, next);
    } else {
      next();
    }
  }, async function (req, res, next) {
    req.checkQuery('clientSeed', 'Invalid Client Seed')
      .exists()
      .isAlphanumeric()
      .isLength({min: 1, max: 25});

    req.checkQuery('currency', 'Invalid currency')
      .exists()
      .isInt()
      .custom(value => !!currencyCache.findById(value));

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    let diceSeed = {client_seed: '', server_seed: '', nonce: 0};
    let latestUserBets = [];

    if (req.currentUser) {
      diceSeed = await db.getActiveDiceSeed(req.currentUser.id);
      if (!diceSeed) {
        const newServerSeed = dice.generateServerSeed();
        const newClientSeed = req.query.clientSeed;

        diceSeed = await db.addNewDiceSeed(req.currentUser.id, newServerSeed, newClientSeed);
      }

      latestUserBets = await db.getLatestUserDiceBets(req.currentUser.id);
    }

    const bankRoll = await db.getBankrollByCurrency(req.query.currency);

    res.json({
      clientSeed: diceSeed.client_seed,
      serverSeedHash: diceSeed.server_seed ? dice.hashServerSeed(diceSeed.server_seed) : '',
      nonce: diceSeed.nonce,
      latestUserBets,
      maxWin: bankRoll.max_win,
      minBetAmount: bankRoll.min_bet_amount,
      isBettingDisabled: false
    });
  });

  router.post('/bet', mw.allowCustomerByCountry, mw.requireLoggedIn, mw.requireWhitelistedIp, async function (req, res, next) {
    req.checkBody('currency', 'Invalid currency')
      .exists()
      .isInt()
      .custom(value => !!currencyCache.findById(value));

    req.checkBody('target', 'Invalid target')
      .exists()
      .custom(value => (value === dice.targets.hi || value === dice.targets.lo));

    req.checkBody('chance', 'Invalid chance')
      .exists()
      .isFloat()
      .custom(value => value >= 0.0001 && value <= 98.99);

    req.checkBody('betAmount', 'Invalid bet amount')
      .custom(amount => require('./validators/amountValidator')(amount));

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      // Only send first error message
      const errors = validationResult.array();
      const errorMsg = errors[0].msg;

      return res.status(400).json({error: errorMsg});
    }

    if (req.currentUser.betting_disabled) {
      return res.status(400).json({error: 'Betting disabled on account'});
    }

    const bankRoll = await db.getBankrollByCurrency(req.body.currency);

    const currency = parseInt(req.body.currency, 10);
    const betAmount = new BigNumber(req.body.betAmount);
    const minBetAmount = new BigNumber(bankRoll.min_bet_amount);
    const maxWin = new BigNumber(bankRoll.max_win);
    const chance = new BigNumber(req.body.chance);
    const multiplier = new BigNumber(99).dividedBy(chance);
    const target = req.body.target;

    if (betAmount.lt(minBetAmount)) {
      const currencyName = currencyCache.getFieldById(currency, 'name');
      const minBetAmountFloat = minBetAmount.dividedBy(new BigNumber(10).pow(currencyCache.getFieldById(currency, 'scale')));
      return res.status(400).json({error: `Min bet amount for ${currencyName} is ${minBetAmountFloat}`});
    }

    const potentialProfit = betAmount.times(multiplier).minus(betAmount);

    if (potentialProfit.lt(0.00000001)) {
      return res.status(400).json({error: 'Min profit too low'});
    }

    if (potentialProfit.gt(maxWin)) {
      return res.status(400).json({error: 'Profit greater than max'});
    }

    const seed = await db.getActiveDiceSeed(req.currentUser.id);
    const roll = dice.calculateDiceRoll(seed.server_seed, seed.client_seed, seed.nonce);
    const profit = dice.calculateProfit(roll, chance, betAmount.toString(), target);

    try {
      const result = await db.doDiceBet(
        req.currentUser.id,
        betAmount.toString(),
        currency,
        profit,
        roll,
        req.body.target,
        chance.toNumber(),
        seed.id,
        seed.nonce
      );

      res.json(result);

      const eventPayload = {
        ...result,
        username: req.currentUser.username,
        stats_hidden: req.currentUser.stats_hidden
      };
      eventEmitter.emit(types.DICE_BET, eventPayload);

      await db.updateMonthlyBetStats(req.currentUser.id, result.date, betAmount.toString(), currency, profit, 'dice');
    } catch (e) {
      if (e.message === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json({error: 'Balance too low'});
      }

      throw e;
    }
  });

  router.post('/set-client-seed', mw.requireLoggedIn, mw.requireWhitelistedIp, async function (req, res, next) {
    req.checkBody('clientSeed', 'Invalid Client Seed')
      .exists()
      .isAlphanumeric()
      .isLength({min: 1, max: 25});

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({error: 'Invalid client seed'});
    }

    const seed = await db.setNewDiceClientSeed(req.currentUser.id, req.body.clientSeed);

    res.json(seed);
  });

  router.post('/generate-new-seed', mw.requireLoggedIn, mw.requireWhitelistedIp, async function (req, res, next) {
    req.checkBody('clientSeed', 'Invalid Client Seed')
      .exists()
      .isAlphanumeric()
      .isLength({min: 1, max: 25});

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({error: 'Invalid client seed'});
    }

    const result = await db.generateNewSeed(req.currentUser.id, req.body.clientSeed);

    res.json(result);
  });

  return router;
};
