const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const helpers = require('../helpers');
const mw = require('../middleware');
const mailer = require('../mailer');

const {
  validateChangeEmail,
  validateChangePassword,
  validateEnable2fa,
  validateWhitelistedIp
} = require('./validators/accountValidators');

module.exports = (currencyCache) => {
  const router = express.Router();

  router.use(mw.requireLoggedIn);
  router.use(mw.requireWhitelistedIp);

  router.post('/change-email', async function (req, res, next) {
    await validateChangeEmail(req);

    await db.updateEmail(req.currentUser.id, req.body.email);

    const verifyEmailToken = await db.createVerifyEmailToken(req.currentUser.id, req.body.email);
    mailer.sendVerificationEmail(req.currentUser.username, req.body.email, verifyEmailToken.id);

    res.end();
  });

  router.post('/resend-verification-link', async function (req, res, next) {
    if (!req.currentUser.email) {
      return res.status(400).json({error: 'Email not found'});
    }

    const verifyEmailToken = await db.createVerifyEmailToken(req.currentUser.id, req.currentUser.email);
    mailer.sendVerificationEmail(req.currentUser.username, req.currentUser.email, verifyEmailToken.id);
    res.end();
  });

  router.post('/change-password', async function (req, res, next) {
    await validateChangePassword(req);

    const isPasswordCorrect = await bcrypt.compare(req.body.existingPassword, req.currentUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({error: 'Invalid existing password'});
    }

    const newPasswordHash = await bcrypt.hash(req.body.password2, 10);

    await db.updatePassword(req.currentUser.id, newPasswordHash, req.cookies.session);

    res.end();
  });

  router.get('/2fa-key', async function (req, res, next) {
    if (req.currentUser.is_2fa_enabled) {
      return res.status(400).send({error: 'Two factor authentication is already enabled'});
    }

    res.json({
      key: req.currentUser.mfa_key,
      qr: await helpers.get2faQR(req.currentUser.mfa_key)
    });
  });

  router.post('/enable-2fa', async function (req, res, next) {
    if (req.currentUser.is_2fa_enabled) {
      return res.status(400).json({error: 'Two factor authentication is already enabled'});
    }

    await validateEnable2fa(req);

    if (!helpers.isOtpValid(req.currentUser.mfa_key, req.body.otp)) {
      return res.status(400).json({error: 'Invalid two factor code'});
    }

    await db.enableTwofactor(req.currentUser.id);

    await db.saveUsedTwoFactorCode(req.currentUser.id, req.body.otp);

    res.end();
  });

  router.post('/disable-2fa', mw.require2fa, async function (req, res, next) {
    if (!req.currentUser.is_2fa_enabled) {
      return res.status(400).json({error: 'Two factor authentication is not enabled for this account'});
    }

    const newMfaKey = helpers.getNew2faSecret();

    await db.disableTwoFactor(req.currentUser.id, newMfaKey);

    res.end();
  });

  router.post('/add-whitelisted-ip', async function (req, res, next) {
    await validateWhitelistedIp(req, true);

    const ip = req.body.ip || helpers.getIp(req);

    await db.addIpInWhitelist(ip, req.currentUser.id);
    await db.logoutAllSessionsWithoutWhitelistedIps(req.currentUser.id);

    res.end();
  });

  router.post('/remove-whitelisted-ip', mw.require2fa, async function (req, res, next) {
    await validateWhitelistedIp(req, false);

    await db.removeIpFromWhitelist(req.body.ip, req.currentUser.id);

    res.end();
  });

  router.get('/get-whitelisted-ips', async function (req, res, next) {
    const ips = await db.getWhitelistedIps(req.currentUser.id);

    res.json({ips});
  });

  return router;
};
