const express = require('express');
const db = require('../db');
const mw = require('../middleware');

const {
  validateIgnoreUser,
  validateToggleDisplayHighrollersInChat
} = require('./validators/chatValidators');

module.exports = () => {
  const router = express.Router();

  router.use(mw.requireLoggedIn);
  router.use(mw.requireWhitelistedIp);

  router.post('/ignore-user', async function (req, res, next) {
    await validateIgnoreUser(req);

    const userExists = await db.getUserByName(req.body.username);

    if (!userExists) {
      return res.status(400).json({error: 'USER_NOT_FOUND'});
    }

    await db.ignoreUser(req.currentUser.id, req.body.username);

    res.end();
  });

  router.post('/unignore-user', async function (req, res, next) {
    await validateIgnoreUser(req);

    const userExists = await db.getUserByName(req.body.username);

    if (!userExists) {
      return res.status(400).json({error: 'USER_NOT_FOUND'});
    }

    await db.unIgnoreUser(req.currentUser.id, req.body.username);

    res.end();
  });

  router.post('/toggle-display-highrollers-in-chat', async function (req, res, next) {
    await validateToggleDisplayHighrollersInChat(req);

    await db.toggleDisplayHighrollersInChat(req.currentUser.id, req.body.option);

    res.end();
  });

  return router;
};
