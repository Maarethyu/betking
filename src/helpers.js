const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const getNew2faSecret = function () {
  const secret = speakeasy.generateSecret({length: 32, name: 'BetKing'});
  console.log(secret);
  return secret.base32;
}

const get2faQR = async function (secret) {
  const qr = await qrcode.toDataURL(`otpauth://totp/BetKing?secret=${secret}`);
  return qr;
}

const isOtpValid = function (base32Secret, otp) {
  return speakeasy.totp.verify({secret: base32Secret, encoding: 'base32', token: otp, window: 1});
}

module.exports = {
  get2faQR,
  getNew2faSecret,
  isOtpValid
};
