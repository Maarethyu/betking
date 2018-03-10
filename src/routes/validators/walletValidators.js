const throwValidationErrors = require('./throwValidationErrors');
const ValidationError = require('./ValidationError');
const {
  validateCurrencyInQuery,
  validateCurrency,
  validateAddress,
  validateAmount,
  validateBooleanOption,
  validateLimit,
  validateSkip,
  validateSort,
  validateToken,
  validateUsername
} = require('./validators');

const validateDepositAddress = async function (req, currencyCache) {
  validateCurrencyInQuery(req, currencyCache);

  await throwValidationErrors(req);
};

const validateWithdraw = async function (req, currencyCache) {
  validateCurrency(req, currencyCache);
  validateAddress(req, currencyCache);
  validateAmount(req);

  await throwValidationErrors(req);
};

const validateSetConfirmWithdrawByEmail = async function (req) {
  validateBooleanOption(req);

  await throwValidationErrors(req);
};

const validateWalletTransactions = async function (req) {
  validateLimit(req);
  validateSkip(req);
  validateSort(req, ['amount', 'created_at']);

  await throwValidationErrors(req);
};

const validateAddWhitelistedAddress = async function (req, currencyCache) {
  validateCurrency(req, currencyCache);
  validateAddress(req, currencyCache);

  await throwValidationErrors(req);
};

const validateRemoveWhitelistedAddress = async function (req, currencyCache) {
  validateCurrency(req, currencyCache);

  await throwValidationErrors(req);
};

const validateConfirmWithdraw = async function (req) {
  validateToken(req);

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    throw new ValidationError({error: 'Invalid token'});
  }
};

const validateSendTip = async function (req, currencyCache) {
  validateCurrency(req, currencyCache);
  validateUsername(req);
  validateAmount(req);

  await throwValidationErrors(req);
};

module.exports = {
  validateDepositAddress,
  validateWithdraw,
  validateSetConfirmWithdrawByEmail,
  validateWalletTransactions,
  validateAddWhitelistedAddress,
  validateRemoveWhitelistedAddress,
  validateConfirmWithdraw,
  validateSendTip
};
