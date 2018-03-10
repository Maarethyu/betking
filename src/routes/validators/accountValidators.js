const throwValidationErrors = require('./throwValidationErrors');
const ValidationError = require('./ValidationError');
const db = require('../../db');
const {
  validateEmail,
  validateEmailAvailable,
  validateExistingPassword,
  validatePassword,
  validatePassword2,
  validateOtp,
  validateIp
} = require('./validators');

const validateChangeEmail = async function (req) {
  validateEmail(req, false);
  validateEmailAvailable(req, db, false);

  await throwValidationErrors(req);
};

const validateChangePassword = async function (req) {
  validateExistingPassword(req);
  validatePassword(req);
  validatePassword2(req);

  await throwValidationErrors(req);
};

const validateEnable2fa = async function (req) {
  validateOtp(req, false);

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    throw new ValidationError({error: 'Invalid two factor code'});
  }
};

const validateWhitelistedIp = async function (req, isOptional) {
  validateIp(req, isOptional);

  throwValidationErrors(req);
};

module.exports = {
  validateChangeEmail,
  validateChangePassword,
  validateEnable2fa,
  validateWhitelistedIp
};
