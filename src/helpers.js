const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const config = require('config');
const Transform = require('stream').Transform;
const currencies = require('./currencies');

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
  // Todo - we should also get IP from Cloudflare in prod
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

const getFingerPrint = function (req) {
  return req.body && typeof req.body.fingerprint === 'string' ? req.body.fingerprint : 'unknown';
};

const getUserAgentString = function (req) {
  return req.headers['user-agent'];
};

const isValidUuid = function (sessionId) {
  const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return uuidV4Regex.test(sessionId);
};

const addCsrfToken = function (csrfToken) {
  const parser = new Transform();

  parser._transform = function (data, encoding, done) { // eslint-disable-line no-underscore-dangle
    const str = data.toString().replace(
      '</body>',
      `<input type="hidden" id="csrfToken" value="${csrfToken}"/></body>`
    );
    done(null, str);
  };

  return parser;
};

const getCurrencyToQueryFromAddressTable = function (currency) {
  /* Check if currency is an eth token, if yes, get ethereum address */
  let currencyToQuery = currency;

  const currencyConfig = currencies.find(c => c.value === currency);
  if (currencyConfig.addressType === 'ethereum') {
    const ethInConfig = currencies.find(c => c.symbol === 'ETH');

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

const getCurrencyField = function (currencyValue, field) {
  const currency = currencies.find(c => c.value === currencyValue);

  if (!currency) {
    return null;
  }

  return currency[field];
}

module.exports = {
  getIp,
  getFingerPrint,
  getUserAgentString,
  isValidUuid,
  get2faQR,
  getNew2faSecret,
  isOtpValid,
  addCsrfToken,
  getCurrencyToQueryFromAddressTable,
  getAddressQr,
  getCurrencyField
};
