const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const mailer = require('../mailer');
const helpers = require('../helpers');

const createSession = async function (res, userId, rememberMe) {
  const session = await db.createSession(userId, rememberMe ? '365 days' : '2 weeks');

  res.cookie('session', session.id,
    {
      maxAge: rememberMe ? 365 * 24 * 60 * 60 * 1000 : 14 * 24 * 60 * 60 * 1000,
      secure: false, // TODO -- have cookie.secure as config variable
      httpOnly: true
    });
};

router.post('/login', async function (req, res, next) {
  req.check('password', 'Invalid Password').exists();
  req.check('username', 'Invalid Username').exists();
  req.check('rememberme', 'Invalid remember me option').isBoolean();
  req.check('otp', 'Invalid two factor code').exists()
    .isInt().isLength({min: 6, max: 6})
    .optional({checkFalsy: true});

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({errors});
  }

  const user = await db.getUserByName(req.body.username);
  if (!user) {
    return res.status(401).json({error: 'Login failed'});
  }

  /* Handle captcha validation for failedAttempts > 3 */
  const failedAttempts = await db.getConsecutiveFailedLogins(user.id);

  const isCaptchaOk = failedAttempts < 3 ||
    await require('./validators/captchaValidator')(req.body['g-recaptcha-response']);

  /* If user locked out, return */
  if (user.locked_at) {
    return res.status(401).json({error: 'Account locked'});
  }

  /* Check for password, log login attempt */
  const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

  /* Check for 2fa if enabled */
  let isTwoFactorOk = user.mfa_key
    ? helpers.isOtpValid(user.mfa_key, req.body.otp)
    : true;

  const isLoginSuccessful = isPasswordCorrect && isCaptchaOk && isTwoFactorOk;

  await db.logLoginAttempt(user.id, isLoginSuccessful);

  if (!isLoginSuccessful) {
    if (failedAttempts >= 2) {
      res.cookie('login_captcha', 'yes', {
        maxAge: 60 * 1000,
        httpOnly: false
      });
    }

    return res.status(401).json({error: 'Login failed'});
  }

  await createSession(res, user.id, req.body.rememberme);
  res.json(user); // TODO don't return user
});

router.post('/register', async function (req, res, next) {
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

  const hash = await bcrypt.hash(req.body.password, 10);

  const user = await db.createUser(req.body.username, hash, req.body.email);
  if (user) {
    await createSession(res, user.id, false);
    res.json(user); // TODO this shouldn't return user
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

  /* If user has an active reset token, do not send email */
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

module.exports = router;
