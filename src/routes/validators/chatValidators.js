const throwValidationErrors = require('./throwValidationErrors');
const {
  validateUsername,
  validateBooleanOption
} = require('./validators');

const validateIgnoreUser = async function (req) {
  validateUsername(req);

  await throwValidationErrors(req);
};

const validateToggleDisplayHighrollersInChat = async function (req) {
  validateBooleanOption(req);

  await throwValidationErrors(req);
};

module.exports = {
  validateIgnoreUser,
  validateToggleDisplayHighrollersInChat
};
