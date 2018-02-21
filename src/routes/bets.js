const express = require('express');
const db = require('../db');
const {hashServerSeed} = require('../games/dice');

module.exports = () => {
  const router = express.Router();

  router.get('/bet-details', async function (req, res, next) {
    req.checkQuery('id', 'Invalid id')
      .exists()
      .isInt();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }
    try {
      const result = await db.getBetDetails(req.query.id);
      let userName = result.username;

      if (result.stats_hidden && ((req.currentUser && req.currentUser.id !== result.player_id) || !req.currentUser)) {
        userName = '[Hidden]';
      }

      res.json({
        betAmount: result.bet_amount,
        betId: result.id,
        date: result.date,
        currency: result.currency,
        profit: result.profit,
        gameType: result.game_type,
        gameDetails: result.game_details,
        status: result.in_use ? 'Current' : 'Not Current',
        serverSeed: result.in_use ? 'Not Available - seed still in use' : result.server_seed,
        clientSeed: result.client_seed,
        serverSeedHash: hashServerSeed(result.server_seed),
        nonce: result.seed_details.nonce,
        userName
      });
    } catch (e) {
      if (e.message === 'BET_NOT_FOUND') {
        return res.status(400).json({error: e.message});
      }

      throw e;
    }
  });

  return router;
};
