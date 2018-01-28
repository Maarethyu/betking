const express = require('express');
const bcrypt = require('bcrypt');
const BigNumber = require('bignumber.js');
const router = express.Router();
const db = require('../db');
const helpers = require('../helpers');
const mw = require('../middleware');
const mailer = require('../mailer');
const currencies = require('../currencies');

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
    is2faEnabled: !!req.currentUser.mfa_key,
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

  /* Send mail for email id verification */
  const verifyEmailToken = await db.createVerifyEmailToken(req.currentUser.id, req.body.email);
  mailer.sendVerificationEmail(req.currentUser.username, req.body.email, verifyEmailToken.id);

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

  await db.updatePassword(req.currentUser.id, newPasswordHash, req.cookies.session);

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
  req.check('id', 'Invalid session id').exists()
    .trim()
    .isUUID(4);

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

router.get('/2fa-key', async function (req, res, next) {
  /* If user has 2fa enabled, do not generate or send key */
  if (req.currentUser.mfa_key) {
    return res.status(400).send({error: 'Two factor authentication is already enabled'});
  }

  /* Check if user already has a temp mfa secret, if yes return with secret */
  if (req.currentUser.temp_mfa_key) {
    return res.json({
      key: req.currentUser.temp_mfa_key,
      qr: await helpers.get2faQR(req.currentUser.temp_mfa_key)
    });
  }

  /* User does not have temp secret: Generate new mfa_secret, write to temp field and send */
  const newKey = await db.addTemp2faSecret(req.currentUser.id, helpers.getNew2faSecret());

  return res.json({
    key: newKey.temp_mfa_key,
    qr: await helpers.get2faQR(newKey.temp_mfa_key)
  });
});

router.post('/enable-2fa', async function (req, res, next) {
  /* Check if user has it already enabled, if yes return */
  if (req.currentUser.mfa_key) {
    return res.status(400).json({error: 'Two factor authentication is already enabled'});
  }

  /* Check if two factor code is valid, if not return with error */
  req.check('otp').exists()
    .isInt()
    .isLength({min: 6, max: 6});

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return res.status(400).json({error: 'Invalid two factor code'});
  }

  /* Check if two factor code is correct, if not return with error */
  if (!helpers.isOtpValid(req.currentUser.temp_mfa_key, req.body.otp)) {
    return res.status(400).json({error: 'Invalid two factor code'});
  }

  /* Two factor code is valid and correct, enable 2fa for user */
  await db.enableTwofactor(req.currentUser.id);

  /* Insert this code as a used code */
  await db.insertTwoFactorCode(req.currentUser.id, req.body.otp);

  res.end();
});

router.post('/disable-2fa', mw.require2fa, async function (req, res, next) {
  /* Check if user has it enabled, if no - return */
  if (!req.currentUser.mfa_key) {
    return res.status(400).json({error: 'Two factor authentication is not enabled for this account'});
  }

  /* Two factor code was not used before. We can disable two factor auth now */
  await db.disableTwoFactor(req.currentUser.id);

  res.end();
});

router.post('/add-whitelisted-ip', async function (req, res, next) {
  /* Requires req.body.ip to be a valid ip, if not provided, set current ip as whitelisted */
  req.check('ip', 'Invalid ip')
    .exists()
    .trim()
    .isIP()
    .optional({checkFalsy: true});

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return res.status(400).json({errors: validationResult.array()});
  }

  const ip = req.body.ip || helpers.getIp(req);

  await db.addIpInWhitelist(ip, req.currentUser.id);

  res.end();
});

router.post('/remove-whitelisted-ip', mw.require2fa, async function (req, res, next) {
  req.check('ip', 'Invalid ip').exists()
    .trim()
    .isIP();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return res.status(400).json({errors: validationResult.array()});
  }

  await db.removeIpFromWhitelist(req.body.ip, req.currentUser.id);

  res.end();
});

router.get('/get-whitelisted-ips', async function (req, res, next) {
  const ips = await db.getWhitelistedIps(req.currentUser.id);

  res.json({ips});
});

router.get('/get-login-attempts', async function (req, res, next) {
  const loginAttempts = await db.getLoginAttempts(req.currentUser.id);

  res.json({loginAttempts});
});

router.get('/balances', async function (req, res, next) {
  // TODO: Do we need pagination for this api? It is always going to send limited amount of data
  const balances = await db.getAllBalancesForUser(req.currentUser.id);

  res.json({balances});
});

router.get('/deposit-address', async function (req, res, next) {
  /* Check if currency is valid and supported */
  req.checkQuery('currency', 'Invalid currency')
    .exists()
    .isInt()
    .custom(value => require('./validators/currencyValidator')(value));

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return res.status(400).json({errors: validationResult.array()});
  }

  /* Fetch address for (currency, user_id) from db */
  const address = await db.getDepositAddress(req.currentUser.id, parseInt(req.query.currency, 10));

  if (!address) {
    return res.status(400).send({error: 'NO_DEPOSIT_ADDRESS_AVAILABLE'});
  }
  const addressQr = await helpers.getAddressQr(address);

  res.json({address, addressQr});
});

// TODO: Add isCustomerAllowed middleware (check for CF-IPCountry ?)
router.post('/withdraw', mw.require2fa, async function (req, res, next) {
  /* Check if currency is valid and supported */
  req.checkBody('currency', 'Invalid currency')
    .exists()
    .isInt()
    .custom(value => require('./validators/currencyValidator')(value));

  req.checkBody('address', 'Invalid address')
    .exists()
    .custom(address => require('./validators/addressValidator')(address, req.body.currency));

  req.checkBody('amount')
    .exists()
    .custom(amount => require('./validators/amountValidator')(amount));

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return res.status(400).json({errors: validationResult.array()});
  }

  const currency = currencies.find(c => c.value === req.body.currency);

  /* Check if withdrawal amount is in permissible limit */
  if (new BigNumber(currency.minWdLimit).gt(new BigNumber(req.body.amount))) {
    return res.status(400).json({error: 'Requested amount is less than minimum withdrawal limit'});
  }

  const wdFee = new BigNumber(currency.wdFee).toString();

  /* Create a withdrwal entry in db and reduce user balance */
  try {
    await db.createWithdrawalEntry(
      req.currentUser.id,
      req.body.currency,
      wdFee,
      req.body.amount,
      req.body.address
    );

    res.end();
  } catch (e) {
    if (e.message === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({error: 'Insufficient balance'});
    }

    throw e;
  }
});

router.get('/pending-withdrawals', async function (req, res, next) {
  req.checkQuery('limit', 'Invalid limit param')
    .exists()
    .isInt()
    .optional({checkFalsy: true});

  req.checkQuery('skip', 'Invalid skip param')
    .exists()
    .isInt()
    .optional({checkFalsy: true});

  req.checkQuery('sort', 'Invalid sort param')
    .exists()
    .isIn(['amount', 'created_at'])
    .optional({checkFalsy: true});

  const {results, count} = await db.getPendingWithdrawals(req.currentUser.id, req.query.limit || 10, req.query.skip || 0, req.query.sort || 'created_at');

  res.json({results, count});
});

router.get('/withdrawal-history', async function (req, res, next) {
  req.checkQuery('limit', 'Invalid limit param')
    .exists()
    .isInt()
    .optional({checkFalsy: true});

  req.checkQuery('skip', 'Invalid skip param')
    .exists()
    .isInt()
    .optional({checkFalsy: true});

  req.checkQuery('sort', 'Invalid sort param')
    .exists()
    .isIn(['amount', 'created_at'])
    .optional({checkFalsy: true});

  const {results, count} = await db.getWithdrawalHistory(req.currentUser.id, req.query.limit || 10, req.query.skip || 0, req.query.sort || 'created_at');

  res.json({results, count});
});

router.get('/deposit-history', async function (req, res, next) {
  req.checkQuery('limit', 'Invalid limit param')
    .exists()
    .isInt()
    .optional({checkFalsy: true});

  req.checkQuery('skip', 'Invalid skip param')
    .exists()
    .isInt()
    .optional({checkFalsy: true});

  req.checkQuery('sort', 'Invalid sort param')
    .exists()
    .isIn(['amount', 'created_at'])
    .optional({checkFalsy: true});

  const {results, count} = await db.getDepositHistory(req.currentUser.id, req.query.limit || 10, req.query.skip || 0, req.query.sort || 'created_at');

  res.json({results, count});
});

module.exports = router;
