const express = require('express');
const config = require('config');
const UserService = require('../services/userService');
const db = require('../db');

const router = express.Router();

module.exports = function () {
  const userService = new UserService(db);

  const newToken = async (req) => {
    if (req.currentUser) {
      const isVip = await userService.isVip(req.currentUser.id);

      const cubeiaToken = await db.cubeia.tokenFor(req.currentUser.id, req.currentUser.username, isVip, req.currentUser.username === 'dean');
      return cubeiaToken;
    } else {
      const cubeiaToken = await db.cubeia.tokenForAnonymous();
      return cubeiaToken;
    }
  };

  const cubeiaUrl = config.get('CUBEIA_URL');

  router.get('', async (req, res) => {
    const cubeiaToken = await newToken(req);
    res.redirect(`${cubeiaUrl}/${cubeiaToken}`);
  });

  router.get('/tables/:tableId', async (req, res) => {
    const cubeiaToken = await newToken(req);
    res.redirect(`${cubeiaUrl}/${cubeiaToken}/table/${req.params.tableId}`);
  });

  router.get('/tournaments/:tournamentName', async (req, res) => {
    const cubeiaToken = await newToken(req);
    res.redirect(`${cubeiaUrl}/${cubeiaToken}/tournament/${req.params.tournamentName}`);
  });

  return router;
};
