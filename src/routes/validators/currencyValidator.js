const currencyCache = require('../../currencyCache');

module.exports = (currency) => {
  let value = currency;

  if (typeof currency !== 'number') {
    value = parseInt(currency, 10);
  }

  const isCurrencySupported = currencyCache.findById(value);

  return !!isCurrencySupported;
};
