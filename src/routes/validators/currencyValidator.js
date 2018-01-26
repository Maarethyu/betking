const currencies = require('../../currencies');

/**
 * Accepts currency: int / string as argument
 * Returns true if currency supported
 * Returns false if not
 */

module.exports = (currency) => {
  let value = currency;

  if (typeof currency !== 'number') {
    value = parseInt(currency, 10);
  }

  const isCurrencySupported = currencies.find(c => c.value === value);

  return !!isCurrencySupported;
};
