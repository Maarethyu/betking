const express = require('express');

module.exports = (statsCache) => {
  const router = express.Router();

  router.get('/bets', async function (req, res, next) {
    res.json({totalBets: statsCache.totalBets});
  });

  router.get('/all', async function (req, res, next) {
    res.json({stats: statsCache.siteStats});
  });

  return router;
};
