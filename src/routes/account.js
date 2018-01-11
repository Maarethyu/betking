const express = require('express');
const router = express.Router();
const db = require('../db');
const mw = require('../middleware');
const bcrypt = require('bcrypt');

router.use(mw.requireLoggedIn);

router.post('/logout', async function (req, res, next) {
  await db.logoutSession(req.currentUser.id, req.cookies.session);
  res.end();
});

router.get('/me', async function (req, res, next) {
  // todo should this header setting be here?
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.json({
    id: req.currentUser.id,
    username: req.currentUser.username,
    email: req.currentUser.email,
    isEmailVerified: req.currentUser.email_verified,
    isMfaEnabled: !!req.currentUser.mfa_key,
    dateJoined: req.currentUser.date_joined
  });
});

router.post('/change-email', async function (req, res, next) {
  req.check('email', 'Invalid Email').exists()
    .trim()
    .isLength({max: 255})
    .isEmail();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({errors});
  }

  // TODO can this be a custom express-validator?
  const emailExists = await db.isEmailAlreadyTaken(req.body.email);
  if (emailExists) {
    return res.status(409).json({error: 'Email already exists'});
  }

  await db.updateEmail(req.currentUser.id, req.body.email);

  res.end();
});

router.post('/change-password', async function (req, res, next) {
  req.check('existingPassword', 'Invalid existing password').exists()
    .trim()
    .isLength({min: 6, max: 50});

  req.check('password', 'Invalid Password').exists()
    .isLength({min: 6, max: 50});

  req.check('password2', 'Passwords do not match').exists()
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({errors});
  }

  const isPasswordCorrect = await bcrypt.compare(req.body.existingPassword, req.currentUser.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({error: 'Invalid existing password'});
  }

  const newPasswordHash = await bcrypt.hash(req.body.password2, 10);

  await db.updatePassword(req.currentUser.id, newPasswordHash);

  res.end();
});

router.get('/active-sessions', async function (req, res, next) {
  const result = await db.getActiveSessions(req.currentUser.id);

  const sessions = result.map(session => ({
    id: session.id,
    created_at: session.created_at,
    is_current: session.id === req.cookies.session
  }));

  res.json({sessions});
});

router.post('/logout-session', async function (req, res, next) {
  const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

  req.check('id', 'Invalid session id').exists()
    .trim()
    .custom(value => uuidV4Regex.test(value));

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({errors});
  }

  await db.logoutSession(req.currentUser.id, req.body.id);

  res.end();
});

router.post('/logout-all-sessions', async function (req, res, next) {
  await db.logoutAllSessions(req.currentUser.id);

  res.end();
});

router.get('/2fa-secret', async function (req, res, next) {
  if (req.currentUser.mfa_key) {
    return res.status(400).send({error: 'Two factor authentication already enabled'});
  }

  const tempKey = await db.findTempMfaSecret(req.currentUser.id);
});

module.exports = router;
