const throwValidationErrors = require('./throwValidationErrors');
const {
  validateBetId,
  validateBooleanOption
} = require('./validators');

const validateBetDetails = async function (req) {
  validateBetId(req);

  await throwValidationErrors(req);
};

const validateToggleStatsHidden = async function (req) {
  validateBooleanOption(req);

  await throwValidationErrors(req);
};

module.exports = {
  validateBetDetails,
  validateToggleStatsHidden
};
