const BigNumber = require('bignumber.js');

module.exports = (amount) => {
  if (!amount || !(typeof amount === 'number' || typeof amount === 'string')) {
    return false;
  }

  try {
    const amt = new BigNumber(amount);

    return amt.isInteger() && amt.gt(0);
  } catch (e) {
    return false;
  }
};
