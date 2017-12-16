const express = require('express');
const router = express.Router();
const db = require('../db');
const mw = require('../middleware');

router.use(mw.requireLoggedIn);

router.post('/logout', async function (req, res, next) {
  await db.logoutSession(req.currentUser.id, req.cookies.session);
  // return what?
});  

module.exports = router;
