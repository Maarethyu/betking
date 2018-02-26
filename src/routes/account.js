const express = require('express');
const bcrypt = require('bcrypt');
const BigNumber = require('bignumber.js');
const uuidV4 = require('uuid/v4');
const db = require('../db');
const helpers = require('../helpers');
const mw = require('../middleware');
const mailer = require('../mailer');
const {eventEmitter, types} = require('../eventEmitter');
const {validateUsername} = require('./validators/validators');

module.exports = (currencyCache) => {
  const router = express.Router();

  router.use(mw.requireLoggedIn);
  router.use(mw.requireWhitelistedIp);

  router.post('/logout', async function (req, res, next) {
    await db.logoutSession(req.currentUser.id, req.cookies.session);
    res.end();
  });

  router.get('/me', async function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.json({
      id: req.currentUser.id,
      username: req.currentUser.username,
      email: req.currentUser.email,
      isEmailVerified: req.currentUser.email_verified,
      is2faEnabled: req.currentUser.is_2fa_enabled,
      confirmWithdrawals: req.currentUser.confirm_wd,
      dateJoined: req.currentUser.date_joined,
      statsHidden: req.currentUser.stats_hidden,
      bettingDisabled: req.currentUser.betting_disabled,
      showHighrollerBets: req.currentUser.show_highrollers_in_chat,
      ignoredUsers: req.currentUser.ignored_users
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

    const emailExists = await db.isEmailAlreadyTaken(req.body.email);
    if (emailExists) {
      return res.status(409).json({error: 'Email already exists'});
    }

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
      return res.status(400).json({error: 'Invalid existing password'});
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

    req.check('otp').exists()
      .isInt()
      .isLength({min: 6, max: 6});

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({error: 'Invalid two factor code'});
    }

    if (!helpers.isOtpValid(req.currentUser.mfa_key, req.body.otp)) {
      return res.status(400).json({error: 'Invalid two factor code'});
    }

    await db.enableTwofactor(req.currentUser.id);

    await db.insertTwoFactorCode(req.currentUser.id, req.body.otp);

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
    await db.logoutAllSessionsWithoutWhitelistedIps(req.currentUser.id);

    res.end();
  });

  router.post('/remove-whitelisted-ip', mw.require2fa, async function (req, res, next) {
    req.check('ip', 'Invalid ip').exists()
      .trim()
      .isIP();

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
    req.checkQuery('currency', 'Invalid currency')
      .exists()
      .isInt()
      .custom(value => !!currencyCache.findById(value));

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    const currency = parseInt(req.query.currency, 10);
    const currencyToQuery = helpers.getCurrencyToQueryFromAddressTable(currencyCache, currency);
    const address = await db.getDepositAddress(req.currentUser.id, currencyToQuery);

    if (!address) {
      return res.status(400).send({error: 'NO_DEPOSIT_ADDRESS_AVAILABLE'});
    }
    const addressQr = await helpers.getAddressQr(address);

    res.json({address, addressQr});
  });

  // TODO: Add isCustomerAllowed middleware (check for CF-IPCountry ?)
  router.post('/withdraw', mw.require2fa, async function (req, res, next) {
    req.checkBody('currency', 'Invalid currency')
      .exists()
      .isInt()
      .custom(value => !!currencyCache.findById(value));

    const currencyConfig = currencyCache.findById(req.body.currency);

    req.checkBody('address', 'Invalid address')
      .exists()
      .custom(address => require('./validators/addressValidator')(address, currencyConfig));

    req.checkBody('amount')
      .exists()
      .custom(amount => require('./validators/amountValidator')(amount));

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    if (req.currentUser.confirm_wd && (!req.currentUser.email || !req.currentUser.email_verified)) {
      return res.status(400).json({error: 'You have asked to confirm withdrawals by email but you do not have a verified email id added to profile'});
    }

    const currency = currencyCache.findById(req.body.currency);

    if (new BigNumber(currency.min_withdraw_limit).gt(new BigNumber(req.body.amount))) {
      return res.status(400).json({error: 'Requested amount is less than minimum withdrawal limit'});
    }

    const isAddressWhitelisted = await db.isAddressWhitelisted(req.currentUser.id, req.body.currency, req.body.address);
    if (!isAddressWhitelisted) {
      return res.status(400).json({error: 'Cannot withdraw to a non-whitelisted address'});
    }

    const withdrawalFeePerByte = req.body.withdrawalFeePerByte || 0;

    const withdrawalFee = parseInt(req.body.currency, 10) === 0
      ? new BigNumber(withdrawalFeePerByte * 226).toString()
      : new BigNumber(currency.withdrawal_fee).toString();

    const withdrawalStatus = req.currentUser.confirm_wd ? 'pending_email_verification' : 'pending';
    const verificationToken = req.currentUser.confirm_wd ? uuidV4() : null;
    const amountReceived = new BigNumber(req.body.amount)
      .minus(withdrawalFee)
      .toString();

    try {
      await db.createWithdrawalEntry(
        req.currentUser.id,
        req.body.currency,
        withdrawalFee,
        req.body.amount,
        amountReceived,
        req.body.address,
        withdrawalStatus,
        verificationToken
      );

      if (withdrawalStatus === 'pending_email_verification') {
        mailer.sendWithdrawConfirmationEmail(
          req.currentUser.username,
          req.currentUser.email,
          verificationToken,
          currency.symbol,
          new BigNumber(amountReceived).div(new BigNumber(10).pow(currency.scale)),
          req.body.address
        );
      }

      res.end();
    } catch (e) {
      if (e.message === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json({error: 'Insufficient balance'});
      }

      throw e;
    }
  });

  router.post('/set-confirm-withdraw-by-email',
    async function (req, res, next) {
      req.checkBody('confirmWd', 'Invalid confirm withdrawal option').exists()
        .isBoolean();

      const validationResult = await req.getValidationResult();
      if (!validationResult.isEmpty()) {
        return res.status(400).json({errors: validationResult.array()});
      }

      if (!req.body.confirmWd) {
        mw.require2fa(req, res, next);
      } else {
        next();
      }
    },
    async function (req, res, next) {
      try {
        await db.setConfirmWithdrawalByEmail(req.currentUser.id, req.body.confirmWd);

        res.end();
      } catch (e) {
        if (e.message === 'VALID_USER_NOT_FOUND') {
          return res.status(400).send({error: e.message});
        }

        throw e;
      }
    }
  );

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

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

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

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

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

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    const {results, count} = await db.getDepositHistory(req.currentUser.id, req.query.limit || 10, req.query.skip || 0, req.query.sort || 'created_at');

    res.json({results, count});
  });

  router.get('/whitelisted-address', async function (req, res, next) {
    const whitelistedAddresses = await db.getWhitelistedAddresses(req.currentUser.id);

    res.json({whitelistedAddresses});
  });

  router.post('/whitelisted-address/add', mw.require2fa, async function (req, res, next) {
    req.checkBody('currency', 'Invalid currency')
      .exists()
      .isInt()
      .custom(value => !!currencyCache.findById(value));

    const currencyConfig = currencyCache.findById(req.body.currency);

    req.checkBody('address', 'Invalid address')
      .exists()
      .custom(address => require('./validators/addressValidator')(address, currencyConfig));

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    try {
      await db.addWhitelistedAddress(
        req.currentUser.id,
        parseInt(req.body.currency, 10),
        req.body.address
      );

      res.end();
    } catch (e) {
      if (e.message === 'CURRENCY_ALREADY_WHITELISTED') {
        return res.status(400).json({error: e.message});
      }

      throw e;
    }
  });

  router.post('/whitelisted-address/remove', mw.require2fa, async function (req, res, next) {
    req.checkBody('currency', 'Invalid currency')
      .exists()
      .isInt()
      .custom(value => !!currencyCache.findById(value));

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    await db.removeWhitelistedAddress(
      req.currentUser.id,
      parseInt(req.body.currency, 10)
    );

    res.end();
  });

  router.post('/toggle-stats-hidden', async function (req, res, next) {
    req.checkBody('statsHidden', 'Invalid option')
      .exists()
      .isBoolean();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    await db.toggleStatsHidden(req.currentUser.id, req.body.statsHidden);

    eventEmitter.emit(types.TOGGLE_STATS_HIDDEN, {
      username: req.currentUser.username,
      statsHidden: req.body.statsHidden
    });

    res.end();
  });

  router.post('/disable-betting', async function (req, res, next) {
    await db.disableBetting(req.currentUser.id);

    res.end();
  });

  router.post('/ignore-user', async function (req, res, next) {
    validateUsername(req);

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    const userExists = await db.getUserByName(req.body.username);

    if (!userExists) {
      return res.status(400).json({error: 'USER_NOT_FOUND'});
    }

    await db.ignoreUser(req.currentUser.id, req.body.username);

    res.end();
  });

  router.post('/unignore-user', async function (req, res, next) {
    validateUsername(req);

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    const userExists = await db.getUserByName(req.body.username);

    if (!userExists) {
      return res.status(400).json({error: 'USER_NOT_FOUND'});
    }

    await db.unIgnoreUser(req.currentUser.id, req.body.username);

    res.end();
  });

  router.post('/toggle-display-highrollers-in-chat', async function (req, res, next) {
    req.checkBody('option', 'INVALID_OPTION')
      .exists()
      .isBoolean();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return res.status(400).json({errors: validationResult.array()});
    }

    await db.toggleDisplayHighrollersInChat(req.currentUser.id, req.body.option);

    res.end();
  });

  return router;
};
