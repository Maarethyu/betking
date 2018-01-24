/** CURRENCY MASTER LIST
 *
 * value: INTEGER (currency represented by this value in db / api calls.) Note: value !== index of currency in array
 * code: 3 - 4 letter currency code
 * name: Name of currency
 * scale: Number of max decimal places supported
 * maxWdLimit: You cannot withdraw more than this amount
 * minWdLimit: You cannot withdraw less than this amount
 * wdFee: withdrawal fee charged
 * address: Address type - to be used to get the name of address validator
 *
 * icons: Icons will be named as ${code}.svg / ${code}_${color}.svg. // TODO: What about png icons?
 */

// TODO: Symbol field skipped from config (Do we use it anywhere now?)

// TODO: Do we need to add priority based wd fee (slow / medium / priority)?

const currencies = [
  {value: 0, code: 'BTC', name: 'Bitcoin', scale: 8, maxWdLimit: 5, minWdLimit: 0.001, wdFee: 0.0009, addressType: 'bitcoin'},
  {value: 1, code: 'ETH', name: 'Ethereum', scale: 8, maxWdLimit: 100, minWdLimit: 0.001, wdFee: 0.0005, addressType: 'ethereum'},
  {value: 6, code: 'BKB', name: 'BKB', scale: 18, maxWdLimit: 300000, minWdLimit: 100, wdFee: 10, addressType: 'ethereum'},
];

module.exports = currencies;
