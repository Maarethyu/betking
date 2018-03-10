const {
  validateSessionId
} = require('./validators');

const throwValidationErrors = require('./throwValidationErrors');

const validateLogoutSession = async function (req) {
  validateSessionId(req);
  await throwValidationErrors(req);
};

module.exports = {
  validateLogoutSession
};
