const request = require('request-promise');
const config = require('config');

/*
  * Accepts response = g-recaptcha-response from frontend
  * Accepts remote = user's ip from req
  * Returns a promise which:
    * resolves if captcha is correct
    * rejects with an error if captcha is invalid
*/
const validateCaptcha = function (response, remoteip) {
  return request({
    uri: 'https://www.google.com/recaptcha/api/siteverify',
    method: 'POST',
    form: {secret: config.get('CAPTCHA_SECRET'), response, remoteip}
  })
    .then((res) => {
      const validationResponse = JSON.parse(res);
      return validationResponse.success;
    })
    .catch(() => {
      return false;
    });
}

module.exports = {validateCaptcha}; 
