const express = require('express');
const crypto = require('crypto');
const config = require('config');
const BigNumber = require('bignumber.js');
const db = require('../db');

module.exports = (currencyCache) => {
  const router = express.Router();

  const getCurrency = (cubeiaName) => {
    const currencyConfig = currencyCache.findBySymbol(cubeiaName);
    return currencyConfig && currencyConfig.id;
  };

  const securityHeaderValid = (requestId, headerValue) => {
    const result = crypto
      .createHash('md5')
      .update(config.get('CUBEIA_API_KEY') + requestId)
      .digest('hex') === headerValue;
    if (!result) {
      console.log('Cubeia security header not valid', requestId);
    }
    return result;
  };

  const isGuest = (userId) => userId.startsWith('guest');

  const getBalanceInMBTC = async (userId, currency) => {
    if (isGuest(userId)) {
      return 0;
    }

    const currencyConfig = currencyCache.findById(currency);

    const result = await db.wallet.getBalanceForUserByCurrency(userId, currency);
    const balance = result ? result.balance : 0;

    return new BigNumber(balance)
      .dividedBy(new BigNumber(10).pow(currencyConfig.scale))
      .times(1000)
      .toNumber();
  };

  router.get('/authenticate/:token', async (req, res) => {
    const user = await db.cubeia.getUserFor(req.params.token);
    if (!user) {
      res.status(401).send({});
    } else {
      res.json(user);
    }
  });

  router.get('/wallet', async (req, res) => {
    if (!securityHeaderValid(req.body.requestId, req.header('x-api-key'))) {
      res.status(401).send({});
      return;
    }
    res.json({});
  });

  router.post('/wallet/balance', async (req, res) => {
    if (!securityHeaderValid(req.body.requestId, req.header('x-api-key'))) {
      res.status(401).send({});
      return;
    }
    const request = req.body;
    const existingResponse = await db.cubeia.getResponse(request.requestId);
    if (existingResponse) {
      res.json(existingResponse);
      return;
    }
    const balanceAmount = await getBalanceInMBTC(request.externalUserId, getCurrency(request.currency));
    const response = {
      balance: {
        amount: balanceAmount,
        currency: request.currency
      },
      requestId: request.requestId,
      externalUserId: request.externalUserId,
      userId: request.userId
    };
    await db.cubeia.saveRequest(request.requestId, request, response, 'balance');
    res.json(response);
  });

  router.post('/wallet/deposit', async (req, res) => {
    // The game wants to transfer funds from the game to the operator account.
    if (!securityHeaderValid(req.body.requestId, req.header('x-api-key'))) {
      res.status(401).send({});
      return;
    }
    const request = req.body;
    const existingResponse = await db.cubeia.getResponse(request.requestId);
    if (existingResponse) {
      res.json(existingResponse);
      return;
    }
    let balance;
    if (isGuest(request.externalUserId)) {
      balance = 0;
    } else {
      const currency = getCurrency(request.funds.currency);
      const currencyConfig = currencyCache.findById(currency);

      try {
        balance = await db.wallet.withdrawFromCubeia(
          request.externalUserId,
          new BigNumber(request.funds.amount)
            .times(new BigNumber(10).pow(currencyConfig.scale))
            .dividedToIntegerBy(1000)
            .toNumber(),
          currency,
          request.requestId
        );
      } catch (e) {
        if (e.message === 'INSUFFICIENT_BALANCE') {
          res.status(401).send({});
          return;
        }

        throw e;
      }
    }
    const response = {
      balance: {
        amount: balance,
        currency: request.funds.currency
      },
      requestId: request.requestId,
      externalUserId: request.externalUserId,
      userId: request.userId
    };
    await db.cubeia.saveRequest(request.requestId, request, response, 'bk-deposit');
    res.json(response);
  });

  router.post('/wallet/withdraw', async (req, res) => {
    // The game wants to transfer funds from the operator wallet to the game.
    if (!securityHeaderValid(req.body.requestId, req.header('x-api-key'))) {
      res.status(401).send({});
      return;
    }
    const request = req.body;
    const existingResponse = await db.cubeia.getResponse(request.requestId);
    if (existingResponse) {
      res.json(existingResponse);
      return;
    }
    const balanceAmount = await getBalanceInMBTC(request.externalUserId, getCurrency(request.funds.currency));
    if (balanceAmount < request.funds.amount) {
      res.status(402).send({});
      return;
    }
    let balance;
    if (isGuest(request.externalUserId)) {
      balance = 0;
    } else {
      const currency = getCurrency(request.funds.currency);
      const currencyConfig = currencyCache.findById(currency);

      try {
        balance = await db.wallet.depositToCubeia(
          request.externalUserId,
          new BigNumber(request.funds.amount)
            .times(new BigNumber(10).pow(currencyConfig.scale))
            .dividedToIntegerBy(1000)
            .toNumber(),
          currency,
          request.requestId
        );
      } catch (e) {
        if (e.message === 'INSUFFICIENT_BALANCE') {
          res.status(401).send({});
          return;
        }
      }
    }
    const response = {
      balance: {
        amount: balance,
        currency: request.funds.currency
      },
      requestId: request.requestId,
      externalUserId: request.externalUserId,
      userId: request.userId
    };
    await db.cubeia.saveRequest(request.requestId, request, response, 'bk-withdraw');
    res.json(response);
  });

  router.get('/wallet/rollback/:requestId', async (req, res) => {
    // This means that the referenced operation should be rolled backed, any funds removed should be returned and vice versa.
    // Currently this method will only be called for withdraw operations. This typically occurs if a player tries to bring in money on a table / place a bet and the operation time out. In this case we will rollback the withdraw and the player will be prompted to try again manually.
    if (!securityHeaderValid(req.params.requestId, req.header('x-api-key'))) {
      res.status(401).send({});
      return;
    }
    const existingResponse = await db.cubeia.getResponse(`rollback-${req.params.requestId}`);
    if (existingResponse) {
      res.json(existingResponse);
      return;
    }
    const initialRequest = await db.cubeia.getRequest(req.params.requestId);
    if (!initialRequest) {
      res.status(400).send({});
      return;
    }
    if (!isGuest(initialRequest.request.externalUserId)) {
      const currency = getCurrency(initialRequest.request.funds.currency);
      const currencyConfig = currencyCache.findById(currency);
      let balance;

      if (initialRequest.type === 'bk-withdraw') {
        try {
          balance = await db.wallet.withdrawFromCubeia(
            initialRequest.request.externalUserId,
            new BigNumber(initialRequest.request.funds.amount)
              .times(new BigNumber(10).pow(currencyConfig.scale))
              .dividedToIntegerBy(1000)
              .toNumber(),
            currency,
            `rollback-${req.params.requestId}`
          );
        } catch (e) {
          if (e.message === 'INSUFFICIENT_BALANCE') {
            res.status(401).send({});
            return;
          }

          throw e;
        }
      } else if (initialRequest.type === 'bk-deposit') {
        balance = await db.wallet.depositToCubeia(
          initialRequest.request.externalUserId,
          new BigNumber(initialRequest.request.funds.amount)
            .times(new BigNumber(10).pow(currencyConfig.scale))
            .dividedToIntegerBy(1000)
            .toNumber(),
          currency,
          `rollback-${req.params.requestId}`
        );
      }
      if (balance === null) {
        res.status(401).send({});
        return;
      }
    }
    const response = {};
    await db.cubeia.saveRequest(`rollback-${req.params.requestId}`, {}, response, 'rollback');
    res.json(response);
  });

  return router;
};
