const currencies = require('../../currencies');

module.exports = (currency) => {
  let value = currency;

  if (typeof currency !== 'number') {
    value = parseInt(currency, 10);
  }

  const isCurrencySupported = currencies.find(c => c.value === value);

  return !!isCurrencySupported;
};
