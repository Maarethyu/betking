const {
  validateLoginMethod,
  validateRememberMe,
  validateOtp,
  validatePassword,
  validatePassword2,
  validateEmail,
  validateEmailAvailable,
  validateUsername,
  validateUsernameAvailable,
  validateRecaptcha,
  validateToken
} = require('./validators');

const db = require('../../db');
const ValidationError = require('./ValidationError');
const throwValidationErrors = require('./throwValidationErrors');

const validateLoginData = async function (req) {
  validatePassword(req);
  validateLoginMethod(req);
  validateRememberMe(req);
  validateOtp(req, true);

  await throwValidationErrors(req);
};

const validateRegister = async function (req) {
  validatePassword(req);
  validatePassword2(req);
  validateEmail(req, true);
  validateEmailAvailable(req, db, true);
  validateUsername(req);
  validateUsernameAvailable(req, db);
  validateRecaptcha(req);

  await throwValidationErrors(req);
};

const validateForgotPassword = async function (req) {
  validateEmail(req, false);

  await throwValidationErrors(req);
};

const validateResetPassword = async function (req) {
  validatePassword(req);
  validatePassword2(req);
  validateToken(req);

  await throwValidationErrors(req);
};

const validateVerifyEmail = async function (req) {
  validateToken(req);

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    throw new ValidationError({error: 'Invalid token'});
  }
};

module.exports = {
  validateLoginData,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail
};
