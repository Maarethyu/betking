const express = require('express');
const db = require('../db');

module.exports = (statsCache, exchangeRateCache) => {
  const router = express.Router();

  router.get('/bets', async function (req, res, next) {
    res.json({
      totalBets: statsCache.totalBets,
      wonLast24Hours: await statsCache.getWonLast24Hours(),
      exchangeRates: await exchangeRateCache.getExchangeRates()
    });
  });

  router.get('/all', async function (req, res, next) {
    res.json({stats: statsCache.siteStats});
  });

  router.get('/user-stats', async function (req, res, next) {
    req.checkQuery('username', 'Username is required')
      .exists();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    try {
      const results = await db.bets.getUserStats(req.query.username);

      const user = {
        id: results[0].id,
        username: results[0].username,
        dateJoined: results[0].date_joined,
      };

      let stats = results.map(b => ({
        totalBets: b.bets,
        profits: b.profits,
        totalWagered: b.total_wagered,
        currency: b.currency
      }));

      if (results[0].stats_hidden && ((req.currentUser && req.currentUser.id !== results[0].id) || !req.currentUser)) {
        stats = null;
      }

      res.json({user, stats});
    } catch (e) {
      if (e.message === 'USER_NOT_FOUND') {
        return res.status(400).json({error: e.message});
      }

      throw e;
    }
  });

  router.get('/exchange-rates', async function (req, res, next) {
    const exchangeRates = await exchangeRateCache.getExchangeRates();

    res.json({exchangeRates});
  });

  return router;
};
