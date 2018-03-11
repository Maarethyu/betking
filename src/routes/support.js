const express = require('express');
const db = require('../db');
const mw = require('../middleware');
const mailer = require('../mailer');

const {
  validatePaginatedList,
  validateRaiseSupportTicket
} = require('./validators/supportValidators');

module.exports = (currencyCache) => {
  const router = express.Router();

  router.get('/tickets', mw.requireLoggedIn, mw.requireWhitelistedIp, async function (req, res, next) {
    await validatePaginatedList(req);

    const result = await db.support.getSupportTicketsForUser(req.currentUser.id, req.query.limit || 10, req.query.skip || 0);

    res.json(result);
  });

  router.post('/raise-ticket', async function (req, res, next) {
    await validateRaiseSupportTicket(req);

    const userId = req.currentUser ? req.currentUser.id : null;

    const result = await db.support.addSupportTicket(req.body.name, req.body.email, req.body.message, userId);

    mailer.sendSupportTicketRaisedEmail(req.body.name, req.body.email, req.body.message, result.id);

    res.json({ticketId: result.id});
  });

  return router;
};
