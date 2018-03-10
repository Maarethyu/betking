const throwValidationErrors = require('./throwValidationErrors');
const {
  validateLimit,
  validateSkip,
  validateAffiliateId
} = require('./validators');

const validatePaginatedList = async function (req) {
  validateLimit(req);
  validateSkip(req);

  await throwValidationErrors(req);
};

const validateAffiliateAmountDue = async function (req) {
  validateAffiliateId(req);

  await throwValidationErrors(req);
};

module.exports = {
  validatePaginatedList,
  validateAffiliateAmountDue
};
