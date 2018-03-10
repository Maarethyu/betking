const ValidationError = require('./ValidationError');

const throwValidationErrors = async function (req, code) {
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    throw new ValidationError({errors: validationResult.array()}, code);
  }
};

module.exports = throwValidationErrors;
