const express = require('express');
const db = require('../db');
const mw = require('../middleware');
const {
  validateLogoutSession
} = require('./validators/sessionValidators');

module.exports = () => {
  const router = express.Router();

  router.use(mw.requireLoggedIn);
  router.use(mw.requireWhitelistedIp);

  router.get('/me', async function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.json({
      id: req.currentUser.id,
      username: req.currentUser.username,
      email: req.currentUser.email,
      isEmailVerified: req.currentUser.email_verified,
      is2faEnabled: req.currentUser.is_2fa_enabled,
      confirmWithdrawals: req.currentUser.confirm_withdrawal,
      dateJoined: req.currentUser.date_joined,
      statsHidden: req.currentUser.stats_hidden,
      bettingDisabled: req.currentUser.betting_disabled,
      showHighrollerBets: req.currentUser.show_highrollers_in_chat,
      ignoredUsers: req.currentUser.ignored_users
    });
  });

  router.get('/active-sessions', async function (req, res, next) {
    const result = await db.sessions.getActiveSessions(req.currentUser.id);

    const sessions = result.map(session => ({
      id: session.id,
      created_at: session.created_at,
      is_current: session.id === req.cookies.session
    }));

    res.json({sessions});
  });

  router.post('/logout-session', async function (req, res, next) {
    await validateLogoutSession(req);

    await db.sessions.logoutSession(req.currentUser.id, req.body.id);

    res.end();
  });

  router.post('/logout-all-sessions', async function (req, res, next) {
    await db.sessions.logoutAllSessions(req.currentUser.id);
    res.end();
  });

  router.get('/get-login-attempts', async function (req, res, next) {
    const loginAttempts = await db.logs.getLoginAttempts(req.currentUser.id);

    res.json({loginAttempts});
  });

  return router;
};
