class ValidationError extends Error {
  constructor (response, code) {
    super('ValidationError');
    this.name = 'ValidationError';
    this.response = response;
    this.code = code || 400;
  }
}

module.exports = ValidationError;
