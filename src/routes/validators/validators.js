const validatePassword = function (req) {
  req.checkBody('password', 'Invalid Password').exists()
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

const validateEmailAvailable = function (req, db) {
  req.check('email', 'Email already exists').exists()
    .custom(value => db.isEmailAlreadyTaken(value)
      .then(emailExists => {
        if (emailExists) throw new Error();
      })
    );
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
  req.check('g-recaptcha-response', 'Invalid captcha').exists()
    .custom(value => require('./validators/captchaValidator')(value)
      .then(isCaptchaValid => {
        if (!isCaptchaValid) throw new Error();
      })
    );
};

const validateOtp = function (req) {
  req.checkBody('otp', 'Invalid two factor code').exists()
    .isInt()
    .isLength({min: 6, max: 6})
    .optional({checkFalsy: true});
};

const validateLoginData = function (req) {
  validatePassword(req);
  validateLoginMethod(req);
  validateRememberMe(req);
  validateOtp(req);

  return req.validationErrors();
}

module.exports = {
  validatePassword,
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
  validateLoginData
};
