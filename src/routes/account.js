const express = require('express');
const router = express.Router();
const db = require('../db');
const mw = require('../middleware');

router.use(mw.requireLoggedIn);

router.post('/logout', async function (req, res, next) {
  await db.logoutSession(req.currentUser.id, req.cookies.session);
  // return what?
});

router.get('/me', async function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.json({
        id: req.currentUser.id,
        username: req.currentUser.username,
        email: req.currentUser.email,
        isEmailVerified: req.currentUser.email_verified,
        dateJoined: req.currentUser.date_joined
    });
});

module.exports = router;
