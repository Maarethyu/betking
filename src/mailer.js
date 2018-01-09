const request = require('request-promise');

const config = {
  postmark: {
    serverToken: '52b660d0-d549-4277-81b7-aba0be92257a',
    from: 'admin@betking.io'
  },
  host: 'http://localhost:3002'
};

const sendMail = function (To, Subject, HtmlBody) {
  return request({
    uri: 'https://api.postmarkapp.com/email',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': config.postmark.serverToken
    },
    body: JSON.stringify({From: config.postmark.from, To, Subject, HtmlBody})
  });
};

const logEmailErrors = (toEmail, info) => (e) => {
  console.log(`Sending ${info} email from ${config.postmark.from} to ${toEmail} failed`, e);
};

const templates = {
  resetPassword: (username, token) => `
    <p>Hi ${username}</p>

    <p>Click on the link below to reset your password</p>
    <br>
    <a href="${config.host}/client/reset-password?token=${token}">
      ${config.host}/client/reset-password?token=${token}
    </a>
  `
};

const sendResetPasswordEmail = function (username, email, token) {
  return sendMail(
    email,
    'BetKing | Reset your password',
    templates.resetPassword(username, token)
  )
    .catch(logEmailErrors(email, 'reset password'));
};

module.exports = {
  sendResetPasswordEmail
};
