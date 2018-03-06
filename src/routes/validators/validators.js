const BigNumber = require('bignumber.js');

const validatePassword = function (req) {
  req.checkBody('password', 'Invalid Password').exists()
    .isLength({min: 6, max: 50});
};

const validateExistingPassword = function (req) {
  req.checkBody('existingPassword', 'Invalid Existing Password').exists()
    .isLength({min: 6, max: 50});
};

const validatePassword2 = function (req) {
  req.check('password2', 'Passwords do not match').exists()
    .equals(req.body.password);
};

const validateUsername = function (req) {
  req.checkBody('username', 'Invalid Username').exists()
    .trim()
    .isLength({min: 2, max: 20})
    .matches(/^[a-z0-9_]+$/i) // name contains invalid characters
    .not()
    .matches(/^[_]|[_]$/i) // name starts or ends with underscores
    .not()
    .matches(/[_]{2,}/i); // name contains consecutive underscores
};

const validateUsernameAvailable = function (req, db) {
  req.check('username', 'username already exists').exists()
    .custom(value => db.isUserNameAlreadyTaken(req.body.username)
      .then(userNameExists => {
        if (userNameExists) throw new Error();
      })
    );
};

const validateEmail = function (req, isOptional) {
  req.check('email', 'Invalid Email').exists()
    .trim()
    .isLength({max: 255})
    .isEmail()
    .optional({checkFalsy: isOptional});
};

const validateEmailAvailable = function (req, db, isOptional) {
  req.check('email', 'Email already exists').exists()
    .custom(value => db.isEmailAlreadyTaken(value)
      .then(emailExists => {
        if (emailExists) throw new Error();
      })
    )
    .optional({checkFalsy: isOptional});
};

const validateLoginMethod = function (req) {
  req.checkBody('loginmethod', 'Invalid login method').exists()
    .custom(value => value === 'username' || value === 'email')
    .optional({checkFalsy: true});

  const loginMethod = req.body.loginmethod || 'username';

  if (loginMethod === 'username') {
    validateUsername(req);
  } else if (loginMethod === 'email') {
    validateEmail(req, false);
  }
};

const validateToken = function (req) {
  req.check('token', 'Invalid token').exists()
    .isUUID(4);
};

const validateRememberMe = function (req) {
  req.checkBody('rememberme', 'Invalid remember me option').isBoolean();
};

const validateRecaptcha = function (req) {
  req.check('g-recaptcha-response', 'Invalid captcha').exists();
};

const validateOtp = function (req, isOptional) {
  req.checkBody('otp', 'Invalid two factor code').exists()
    .isInt()
    .isLength({min: 6, max: 6})
    .optional({checkFalsy: isOptional});
};

const validateLimit = function (req) {
  req.checkQuery('limit', 'Invalid limit param')
    .exists()
    .isInt()
    .optional({checkFalsy: true});
};

const validateSkip = function (req) {
  req.checkQuery('skip', 'Invalid skip param')
    .exists()
    .isInt()
    .optional({checkFalsy: true});
};

const validateSort = function (req, sortableFields) {
  req.checkQuery('sort', 'Invalid sort param')
    .exists()
    .isIn(sortableFields)
    .optional({checkFalsy: true});
};

const validateSessionId = function (req) {
  req.checkBody('id', 'Invalid session id').exists()
    .trim()
    .isUUID(4);
};

const validateIp = function (req, isOptional) {
  req.checkBody('ip', 'Invalid ip')
    .exists()
    .trim()
    .isIP()
    .optional({checkFalsy: isOptional});
};

const validateCurrencyInQuery = function (req, currencyCache) {
  req.checkQuery('currency', 'Invalid currency')
    .exists()
    .isInt()
    .custom(value => !!currencyCache.findById(value));
};

const validateCurrency = function (req, currencyCache) {
  req.checkBody('currency', 'Invalid currency')
    .exists()
    .isInt()
    .custom(value => !!currencyCache.findById(value));
};

const validateAddress = function (req, currencyCache) {
  const currencyConfig = currencyCache.findById(req.body.currency);

  req.checkBody('address', 'Invalid address')
    .exists()
    .custom(address => require('./addressValidator')(address, currencyConfig));
};

const validateAmount = function (req) {
  req.checkBody('amount')
    .exists()
    .custom(amount => {
      if (!amount || !(typeof amount === 'number' || typeof amount === 'string')) {
        return false;
      }

      try {
        const amt = new BigNumber(amount);

        return amt.isInteger() && amt.gt(0);
      } catch (e) {
        return false;
      }
    });
};

const validateBooleanOption = function (req) {
  req.checkBody('option', 'Invalid option').exists()
    .isBoolean();
};

const textValidator = function (req, fieldName) {
  req.checkBody(fieldName, `Invalid ${fieldName}`).exists()
    .custom(value => typeof value === 'string')
    .isLength({min: 1, max: 4000});
};

const validateAffiliateId = function (req) {
  req.checkQuery('affiliateId', 'Invalid affiliate id').exists()
    .isInt();
};

const validateLoginData = function (req) {
  validatePassword(req);
  validateLoginMethod(req);
  validateRememberMe(req);
  validateOtp(req, true);

  return req.validationErrors();
};

module.exports = {
  validatePassword,
  validateExistingPassword,
  validatePassword2,
  validateUsername,
  validateUsernameAvailable,
  validateEmail,
  validateEmailAvailable,
  validateLoginMethod,
  validateToken,
  validateRememberMe,
  validateRecaptcha,
  validateOtp,
  validateLimit,
  validateSkip,
  validateSort,
  validateSessionId,
  validateIp,
  validateCurrencyInQuery,
  validateCurrency,
  validateAddress,
  validateAmount,
  validateBooleanOption,
  textValidator,
  validateAffiliateId,
  validateLoginData
};
