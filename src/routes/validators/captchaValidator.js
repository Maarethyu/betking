const request = require('request-promise');

const config = {
  captchaSecret: '6LdWpj8UAAAAAJIfkImnogk7wZhbY8JtQ3fsycW3',
};

/*
  * Accepts response = g-recaptcha-response from frontend
  * Accepts remote = user's ip from req
  * Returns a promise which:
    * resolves if captcha is correct
    * rejects with an error if captcha is invalid
*/

module.exports = (response, remoteip) => request({
  uri: 'https://www.google.com/recaptcha/api/siteverify',
  method: 'POST',
  form: {secret: config.captchaSecret, response, remoteip}
})
  .then((res) => {
    const validationResponse = JSON.parse(res);
    return validationResponse.success;
  })
  .catch(() => {
    return false;
  });
