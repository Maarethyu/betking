const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const config = require('config');

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

module.exports = {
  getIp,
  getFingerPrint,
  getUserAgentString,
  isValidUuid,
  get2faQR,
  getNew2faSecret,
  isOtpValid
};
