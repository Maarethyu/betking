const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const RateLimit = require('express-rate-limit');
const config = require('config');
const db = require('../db');
const mailer = require('../mailer');
const helpers = require('../helpers');

const milliSecondsInYear = 31536000000;
const milliSecondsInTwoWeeks = 1209600000;

const createSession = async function (res, userId, rememberMe, ip, fingerprint) {
  const session = await db.createSession(userId, rememberMe ? '365 days' : '2 weeks', ip, fingerprint);

  res.cookie('session', session.id,
    {
      maxAge: rememberMe ? milliSecondsInYear : milliSecondsInTwoWeeks,
      secure: config.get('SESSION_COOKIE_SECURE'),
      httpOnly: true
    });
};

const apiLimiter = new RateLimit({
  windowMs: 1000,
  max: config.get('REGISTER_RATE_LIMIT'),
  delayAfter: 1,
  delayMs: 200,
  keyGenerator: helpers.getIp
});

module.exports = (currencyCache) => {
  router.post('/login', async function (req, res, next) {
    req.check('password', 'Invalid Password').exists();
    req.check('loginvia', 'Invalid login via option').exists()
      .custom(value => value === 'username' || value === 'email')
      .optional({checkFalsy: true});

    const loginVia = req.body.loginvia || 'username';

    if (loginVia === 'username') {
      req.check('username', 'Invalid Username').exists();
    }

    if (loginVia === 'email') {
      req.check('email', 'Invalid Username').exists()
        .trim()
        .isEmail();
    }

    req.check('rememberme', 'Invalid remember me option').isBoolean();
    req.check('otp', 'Invalid two factor code').exists()
      .isInt()
      .isLength({min: 6, max: 6})
      .optional({checkFalsy: true});

    const errors = req.validationErrors();
    if (errors) {
      return res.status(400).json({errors});
    }

    // Fetch user on basis of login via option
    let user = null;
    if (loginVia === 'username') {
      user = await db.getUserByName(req.body.username);
    } else if (loginVia === 'email') {
      user = await db.getUserByEmail(req.body.email);
    }

    if (!user) {
      return res.status(401).json({error: 'Login failed'});
    }

    // Handle captcha validation for failedAttempts > 3
    const failedAttempts = await db.getConsecutiveFailedLogins(user.id);

    const isCaptchaOk = failedAttempts < 3 ||
      await require('./validators/captchaValidator')(req.body['g-recaptcha-response']);

    // If user locked out, return
    if (user.locked_at) {
      return res.status(401).json({error: 'Account locked'});
    }

    // Check for password, log login attempt
    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

    // Check if ip whitelisted
    // TODO: Should we let user know if his ip was not whitelisted?
    const isIpWhitelisted = await db.isIpWhitelisted(helpers.getIp(req), user.id);

    let isTwoFactorOk = false;
    if (user.is_2fa_enabled) {
      const isOtpValid = helpers.isOtpValid(user.mfa_key, req.body.otp);

      if (isOtpValid) {
        try {
          await db.insertTwoFactorCode(user.id, req.body.otp);
          await db.log2faAttempt(user.id, true, helpers.getIp(req), helpers.getFingerPrint(req), helpers.getUserAgentString(req));
          isTwoFactorOk = true;
        } catch (e) {
          if (e.message === 'CODE_ALREADY_USED') {
            // TODO: Should we let the user know that his OTP has just expired??
            await db.log2faAttempt(user.id, false, helpers.getIp(req), helpers.getFingerPrint(req), helpers.getUserAgentString(req));
            isTwoFactorOk = false;
          } else {
            throw e;
          }
        }
      } else {
        await db.log2faAttempt(user.id, false, helpers.getIp(req), helpers.getFingerPrint(req), helpers.getUserAgentString(req));
        isTwoFactorOk = false;
      }
    } else {
      // If user has 2fa disabled, isTwoFactorOk = true
      isTwoFactorOk = true;
    }

    const isLoginSuccessful = isPasswordCorrect && isCaptchaOk && isIpWhitelisted && isTwoFactorOk;

    await db.logLoginAttempt(user.id, isLoginSuccessful, helpers.getIp(req), helpers.getFingerPrint(req), helpers.getUserAgentString(req));

    if (!isLoginSuccessful) {
      if (failedAttempts >= 2) {
        res.cookie('login_captcha', 'yes', {
          maxAge: 60 * 1000,
          httpOnly: false
        });
      }

      // Lock Account after 5 failed attempts in last 1 minute
      if (failedAttempts >= 4) {
        await db.lockUserAccount(user.id);
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
      confirmWithdrawals: user.confirm_wd
    });
  });

  router.post('/register', apiLimiter, async function (req, res, next) {
    req.check('password', 'Invalid Password').exists()
      .isLength({min: 6, max: 50});

    req.check('password2', 'Passwords do not match').exists()
      .equals(req.body.password);

    req.check('email', 'Invalid Email').exists()
      .trim()
      .isLength({max: 255})
      .isEmail()
      .custom(value => db.isEmailAlreadyTaken(value)
        .then(emailExists => {
          if (emailExists) throw new Error();
        })
      )
      .withMessage('email already exists')
      .optional({checkFalsy: true});

    req.check('username', 'Invalid Username').exists()
      .trim()
      .isLength({min: 2, max: 20})
      .matches(/^[a-z0-9_]+$/i) // name contains invalid characters
      .not()
      .matches(/^[_]|[_]$/i) // name starts or ends with underscores
      .not()
      .matches(/[_]{2,}/i) // name contains consecutive underscores
      .custom(value => db.isUserNameAlreadyTaken(req.body.username)
        .then(userNameExists => {
          if (userNameExists) throw new Error();
        })
      )
      .withMessage('username already exists');

    req.check('g-recaptcha-response', 'Invalid captcha').exists()
      .custom(value => require('./validators/captchaValidator')(value)
        .then(isCaptchaValid => {
          if (!isCaptchaValid) throw new Error();
        })
      );

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    const affiliateId = req.cookies.aff_id || null;

    const hash = await bcrypt.hash(req.body.password, 10);

    const mfaKey = helpers.getNew2faSecret();

    const user = await db.createUser(req.body.username, hash, req.body.email, affiliateId, mfaKey);

    if (user) {
      await createSession(res, user.id, false, helpers.getIp(req), helpers.getFingerPrint(req));

      if (user.email) {
        mailer.sendWelcomeEmail(user.username, user.email);
        const verifyEmailToken = await db.createVerifyEmailToken(user.id, user.email);
        mailer.sendVerificationEmail(user.username, user.email, verifyEmailToken.id);
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.email_verified,
        dateJoined: user.date_joined,
        is2faEnabled: user.is_2fa_enabled,
        confirmWithdrawals: user.confirm_wd
      });
    } else {
      res.status(500)
        .end();
    }
  });

  router.post('/forgot-password', async function (req, res, next) {
    req.check('email', 'Invalid Email').exists()
      .trim()
      .isLength({max: 255})
      .isEmail();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    const successMessage = `We've sent an email to the address entered.
      Click the link in the email to reset your password.
      If you don't see the email, check your spam folder.`;

    const user = await db.getUserByEmail(req.body.email.trim());

    if (!user) {
      return res.status(200).json({message: successMessage});
    }

    // If user has an active reset token, do not send email // TODO why?
    const activeToken = await db.findLatestActiveResetToken(user.id);
    if (activeToken) {
      return res.status(200).json({message: successMessage});
    }

    const resetToken = await db.createResetToken(user.id);

    mailer.sendResetPasswordEmail(user.username, user.email, resetToken.id);

    res.status(200).json({message: successMessage});
  });

  router.post('/reset-password', async function (req, res, next) {
    req.check('password', 'Invalid Password').exists()
      .isLength({min: 6, max: 50});

    req.check('password2', 'Passwords do not match').exists()
      .equals(req.body.password);

    req.check('token', 'Invalid token').exists()
      .isUUID(4);

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    const hash = await bcrypt.hash(req.body.password2, 10);

    try {
      await db.resetUserPasswordByToken(req.body.token, hash);

      res.status(200).json({message: 'Password changed successfully'});
    } catch (e) {
      res.status(409).json({error: 'Invalid token'});
    }
  });

  router.post('/verify-email', async function (req, res, next) {
    req.check('token', 'Invalid token').exists()
      .isUUID(4);

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({error: 'Invalid token'});
    }

    try {
      await db.markEmailAsVerified(req.body.token);

      res.status(200).json({message: 'Email successfully verified.'});
    } catch (e) {
      console.log(e);
      res.status(409).json({error: 'Invalid token'});
    }
  });

  router.get('/config/currencies', async function (req, res, next) {
    const currencies = currencyCache.currencies;

    res.json({currencies});
  });

  router.post('/confirm-withdraw', async function (req, res, next) {
    req.checkBody('token').exists()
      .isUUID(4);

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({error: 'INVALID_TOKEN'});
    }

    try {
      await db.confirmWithdrawByToken(req.body.token);

      res.end();
    } catch (e) {
      if (e.message === 'INVALID_TOKEN') {
        return res.status(400).json({error: e.message});
      }

      throw e;
    }
  });

  return router;
};
