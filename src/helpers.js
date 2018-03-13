const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const config = require('config');
const Transform = require('stream').Transform;
const BigNumber = require('bignumber.js');

const getNew2faSecret = function () {
  const secret = speakeasy.generateSecret({length: 32, name: config.get('PROJECT_NAME')});
  return secret.base32;
};

const get2faQR = async function (secret) {
  const qr = await qrcode.toDataURL(`otpauth://totp/${config.get('PROJECT_NAME')}?secret=${secret}`);
  return qr;
};

const isOtpValid = function (base32Secret, otp) {
  return speakeasy.totp.verify({secret: base32Secret, encoding: 'base32', token: otp, window: 1});
};

const getIp = function (req) {
  return req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

const getFingerPrint = function (req) {
  return req.body && typeof req.body.fingerprint === 'string' ? req.body.fingerprint : 'unknown';
};

const getUserAgentString = function (req) {
  return req.headers['user-agent'];
};

const isValidUuid = function (id) {
  const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return uuidV4Regex.test(id);
};

const addConfigVariables = function (csrfToken) {
  const parser = new Transform();

  const settings = {
    captchaSiteKey: config.get('CAPTCHA_SITE_KEY'),
    csrfToken
  };

  parser._transform = function (data, encoding, done) { // eslint-disable-line no-underscore-dangle
    const str = data.toString().replace(
      '</body>',
      `<script type="text/javascript">window.settings=${JSON.stringify(settings)}</script>
      </body>`
    );
    done(null, str);
  };

  return parser;
};

const getCurrencyToQueryFromAddressTable = function (currencyCache, currency) {
  // Check if currency is an eth token, if yes, get ethereum address
  let currencyToQuery = currency;

  const currencyConfig = currencyCache.findById(currency);
  if (currencyConfig.addressType === 'ethereum') {
    const ethInConfig = currencyCache.findBySymbol('ETH');

    if (ethInConfig) {
      currencyToQuery = ethInConfig.value;
    }
  }

  return currencyToQuery;
};

const getAddressQr = async function (address) {
  const qr = await qrcode.toDataURL(address);
  return qr;
};

const maskUsernameFromBets = function (bets, usernameToStatsHidden, loggedInUsername) {
  return bets.map(bet => {
    let username = bet.username;
    if (usernameToStatsHidden[bet.username] && bet.username !== loggedInUsername) {
      username = '[HIDDEN]';
    }

    return Object.assign({}, bet, {username});
  });
};

const isHighrollerBet = function (betAmount, profit, highrollerAmountForCurrency) {
  return new BigNumber(betAmount).gte(highrollerAmountForCurrency) ||
    new BigNumber(profit).gte(highrollerAmountForCurrency);
};

const sleep = async function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  getIp,
  getFingerPrint,
  getUserAgentString,
  isValidUuid,
  get2faQR,
  getNew2faSecret,
  isOtpValid,
  addConfigVariables,
  getCurrencyToQueryFromAddressTable,
  getAddressQr,
  maskUsernameFromBets,
  isHighrollerBet,
  sleep
};
