const throwValidationErrors = require('./throwValidationErrors');
const {
  validateLimit,
  validateSkip,
  textValidator,
  validateEmail
} = require('./validators');

const validatePaginatedList = async function (req) {
  validateLimit(req);
  validateSkip(req);

  await throwValidationErrors(req);
};

const validateRaiseSupportTicket = async function (req) {
  textValidator(req, 'name');
  textValidator(req, 'message');
  validateEmail(req, false);

  await throwValidationErrors(req);
};

module.exports = {
  validatePaginatedList,
  validateRaiseSupportTicket
};
