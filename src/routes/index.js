const express = require('express');
const router = express.Router();
const db = require('../db');
const mailer = require('../mailer');
const {
  validateEmail,
  textValidator} = require('./validators/validators');

module.exports = () => {
  router.post('/support', async function (req, res, next) {
    textValidator(req, 'name');
    textValidator(req, 'message');
    validateEmail(req, false);

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    const userId = req.currentUser ? req.currentUser.id : null;

    const result = await db.addSupportTicket(req.body.name, req.body.email, req.body.message, userId);

    mailer.sendSupportTicketRaisedEmail(req.body.name, req.body.email, req.body.message, result.id);

    res.json({ticketId: result.id});
  });

  return router;
};
