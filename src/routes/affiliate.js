const express = require('express');
const db = require('../db');
const mw = require('../middleware');

const {
  validateAffiliateAmountDue,
  validatePaginatedList
} = require('./validators/affiliateValidators');

module.exports = (currencyCache) => {
  const router = express.Router();

  router.use(mw.requireLoggedIn);
  router.use(mw.requireWhitelistedIp);

  router.get('/summary', async function (req, res, next) {
    await validatePaginatedList(req);

    const summary = await db.affiliate.getAffiliateSummary(req.currentUser.username, req.currentUser.id);
    const affiliateUsers = await db.affiliate.getAffiliateUsers(req.currentUser.username, req.query.limit || 10, req.query.skip || 0);

    res.json({summary, affiliateUsers});
  });

  router.get('/users', async function (req, res, next) {
    await validatePaginatedList(req);

    const affiliateUsers = await db.affiliate.getAffiliateUsers(req.currentUser.username, req.query.limit || 10, req.query.skip || 0);

    res.json({affiliateUsers});
  });

  router.get('/amount-due', async function (req, res, next) {
    await validateAffiliateAmountDue(req);

    const amountsDueByCurrency = await db.affiliate.getAmountDueByAffiliate(req.currentUser.username, req.currentUser.id, req.query.affiliateId);

    res.json({amountsDueByCurrency});
  });

  return router;
};
