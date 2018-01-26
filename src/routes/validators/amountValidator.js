const BigNumber = require('bignumber.js');

/**
 * Takes amount: numeric / string as input
 *
 * Verifies if it is a valid amount
 * Should be an INT / Should be greater than 0
 */

module.exports = (amount) => {
  if (!amount || !(typeof amount === 'number' || typeof amount === 'string')) {
    return false;
  }

  try {
    const amt = new BigNumber(amount);

    return amt.isInteger() && amt.gt(0);
  } catch (e) {
    /* BigNumber errored with an exception. amount was supplied as numeric and was too large */
    return false;
  }
};
