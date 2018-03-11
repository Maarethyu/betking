const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const RateLimit = require('express-rate-limit');
const config = require('config');
const db = require('../db');
const mailer = require('../mailer');
const helpers = require('../helpers');
const {
  validateLoginData,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail
} = require('./validators/authValidators');
const UserService = require('../services/userService');
const captchaValidator = require('./validators/captchaValidator');
const mw = require('../middleware');
const milliSecondsInYear = 31536000000;
const milliSecondsInTwoWeeks = 1209600000;

const createSession = async function (res, userId, rememberMe, ip, fingerprint) {
  const session = await db.sessions.createSession(userId, rememberMe ? '365 days' : '2 weeks', ip, fingerprint);

  res.cookie('session', session.id,
    {
      maxAge: rememberMe ? milliSecondsInYear : milliSecondsInTwoWeeks,
      secure: config.get('SESSION_COOKIE_SECURE'),
      httpOnly: true
    });
};

const apiLimiter = new RateLimit({
  windowMs: config.get('RATE_LIMITER_REGISTER_WINDOW_IN_MS'),
  max: config.get('REGISTER_RATE_LIMIT'),
  delayAfter: config.get('RATE_LIMITER_DELAY_AFTER'),
  delayMs: config.get('RATE_LIMITER_DELAY_IN_MS'),
  keyGenerator: helpers.getIp
});

module.exports = () => {
  const userService = new UserService(db);

  router.post('/login', async function (req, res, next) {
    await validateLoginData(req);

    const user = await userService.getUserByLoginMethod(req.body.loginmethod, req.body.username, req.body.email);

    if (!user) {
      return res.status(401).json({error: 'Login failed'});
    }

    const failedLoginAttempts = await db.logs.getConsecutiveFailedLoginAttempts(user.id);

    if (failedLoginAttempts >= 3) {
      const captchaValid = await captchaValidator.validateCaptcha(req.body['g-recaptcha-response']);
      if (!captchaValid) {
        return res.status(401).json({error: 'Invalid Captcha'});
      }
    }

    if (user.locked_at) {
      return res.status(401).json({error: 'Account locked'});
    }

    // Check for password, log login attempt
    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

    // Check if ip whitelisted
    // TODO: Should we let user know if his ip was not whitelisted?
    const isIpWhitelisted = await db.users.isIpWhitelisted(helpers.getIp(req), user.id);

    let isTwoFactorOk = false;
    if (user.is_2fa_enabled) {
      const isOtpValid = helpers.isOtpValid(user.mfa_key, req.body.otp);

      if (isOtpValid) {
        try {
          await db.logs.saveUsedTwoFactorCode(user.id, req.body.otp);
          await db.logs.log2faAttempt(user.id, true, helpers.getIp(req), helpers.getFingerPrint(req), helpers.getUserAgentString(req));
          isTwoFactorOk = true;
        } catch (e) {
          if (e.message === 'CODE_ALREADY_USED') {
            // TODO: Should we let the user know that his OTP has just expired??
            await db.logs.log2faAttempt(user.id, false, helpers.getIp(req), helpers.getFingerPrint(req), helpers.getUserAgentString(req));
            isTwoFactorOk = false;
          } else {
            throw e;
          }
        }
      } else {
        await db.logs.log2faAttempt(user.id, false, helpers.getIp(req), helpers.getFingerPrint(req), helpers.getUserAgentString(req));
        isTwoFactorOk = false;
      }
    } else {
      // If user has 2fa disabled, isTwoFactorOk = true
      isTwoFactorOk = true;
    }

    const isLoginSuccessful = isPasswordCorrect && isIpWhitelisted && isTwoFactorOk;

    await db.logs.logLoginAttempt(user.id, isLoginSuccessful, helpers.getIp(req), helpers.getFingerPrint(req), helpers.getUserAgentString(req));

    if (!isLoginSuccessful) {
      if (failedLoginAttempts >= 2) {
        res.cookie('login_captcha', 'yes', {
          maxAge: 60 * 1000,
          httpOnly: false
        });
      }

      // Lock Account after 5 failed attempts in last 1 minute
      if (failedLoginAttempts >= 4) {
        await db.users.lockUserAccount(user.id);
      }

      return res.status(401).json({error: 'Login failed'});
    }

    if (user.email) {
      mailer.sendNewLoginEmail(user.username, helpers.getIp(req), helpers.getUserAgentString(req), user.email);
    }

    await createSession(res, user.id, req.body.rememberme, helpers.getIp(req), helpers.getFingerPrint(req));

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isEmailVerified: user.email_verified,
      dateJoined: user.date_joined,
      is2faEnabled: user.is_2fa_enabled,
      confirmWithdrawals: user.confirm_withdrawal,
      statsHidden: user.stats_hidden,
      bettingDisabled: user.betting_disabled,
      showHighrollerBets: user.show_highrollers_in_chat,
      ignoredUsers: user.ignored_users
    });
  });

  router.post('/register', apiLimiter, async function (req, res, next) {
    await validateRegister(req);

    const captchaValid = await captchaValidator.validateCaptcha(req.body['g-recaptcha-response']);
    if (!captchaValid) {
      return res.status(401).json({error: 'Invalid Captcha'});
    }

    const affiliateId = await userService.extractAffiliateId(req.cookies.aff_id);
    console.log(affiliateId);

    const hash = await bcrypt.hash(req.body.password, 10);

    const mfaKey = helpers.getNew2faSecret();

    const user = await db.users.createUser(req.body.username, hash, req.body.email, affiliateId, mfaKey);

    if (user) {
      await createSession(res, user.id, false, helpers.getIp(req), helpers.getFingerPrint(req));

      if (user.email) {
        const verifyEmailToken = await db.users.createVerifyEmailToken(user.id, user.email);
        mailer.sendWelcomeEmail(user.username, user.email, verifyEmailToken.id);
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.email_verified,
        dateJoined: user.date_joined,
        is2faEnabled: user.is_2fa_enabled,
        confirmWithdrawals: user.confirm_withdrawal,
        statsHidden: user.stats_hidden,
        bettingDisabled: user.betting_disabled,
        showHighrollerBets: user.show_highrollers_in_chat,
        ignoredUsers: user.ignored_users
      });
    } else {
      res.status(500)
        .end();
    }
  });

  router.post('/forgot-password', async function (req, res, next) {
    await validateForgotPassword(req);

    const successMessage = `We've sent an email to the address entered.
      Click the link in the email to reset your password.
      If you don't see the email, check your spam folder.`;

    const user = await db.users.getUserByEmail(req.body.email.trim());

    if (!user) {
      return res.status(200).json({message: successMessage});
    }

    // If user has an active reset token, do not send email // TODO why?
    const activeToken = await db.users.findLatestActiveResetToken(user.id);
    if (activeToken) {
      return res.status(200).json({message: successMessage});
    }

    const resetToken = await db.users.createResetToken(user.id);

    mailer.sendResetPasswordEmail(user.username, user.email, resetToken.id);

    res.status(200).json({message: successMessage});
  });

  router.post('/reset-password', async function (req, res, next) {
    await validateResetPassword(req);

    const hash = await bcrypt.hash(req.body.password2, 10);

    try {
      await db.users.resetUserPasswordByToken(req.body.token, hash);

      res.status(200).json({message: 'Password changed successfully'});
    } catch (e) {
      if (e.message === 'INVALID_TOKEN') {
        return res.status(409).json({error: 'Invalid token'});
      }

      throw e;
    }
  });

  router.post('/verify-email', async function (req, res, next) {
    await validateVerifyEmail(req);

    try {
      await db.users.markEmailAsVerified(req.body.token);

      res.status(200).json({message: 'Email successfully verified.'});
    } catch (e) {
      if (e.message === 'INVALID_TOKEN') {
        return res.status(409).json({error: 'Invalid token'});
      }

      throw e;
    }
  });

  router.post('/logout', mw.requireLoggedIn, async function (req, res, next) {
    await db.sessions.logoutSession(req.currentUser.id, req.cookies.session);
    res.end();
  });

  return router;
};
