const request = require('request-promise');
const db = require('./db');
const config = require('config');

const sendMail = function (address, subject, htmlBody) {
  return request({
    uri: 'https://api.postmarkapp.com/email',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': config.get('MAILER_SERVER_TOKEN')
    },
    body: JSON.stringify({From: config.get('MAILER_SENDER_EMAIL'), To: address, Subject: subject, HtmlBody: htmlBody})
  });
};

const logEmailErrors = (address, msg) => (e) => {
  db.logEmailError(e.message, e.stack, address, msg);
  console.log('MAIL_ERROR', address, msg, e);
};

const templates = {
  resetPassword: (username, token) => `
    <p>Hi ${username}</p>

    <p>Click on the link below to reset your password</p>
    <br>
    <a href="${config.get('MAILER_HOST')}/reset-password?token=${token}">
      ${config.get('MAILER_HOST')}/reset-password?token=${token}
    </a>
  `,

  newLogin: (username, ip, userAgent) => `
    <h2>${config.get('PROJECT_NAME')} Login</h2>
    <br>
    <p>Dear ${username}</p>

    <p>This is to notify you of a successful login to your account.</p>

    <table>
    <tr><td>Login Time: </td><td>${new Date().toUTCString()}</td></tr>
    <tr><td>IP Address: </td><td>${ip}</td></tr>
    <tr><td>User Agent: </td><td>${userAgent}</td></tr>
    </table>

    <p>If you are not the one who logged in or this login is suspicious, please change your password.</p>
    <br>
    <p>Best regards,</p>
    <p>${config.get('PROJECT_NAME')} Team</p>
  `,

  welcomeEmail: (username) => `
    <p>Dear ${username}</p>

    <p>Welcome to ${config.get('PROJECT_NAME')}!</p>
  `,

  verificationEmail: (username, token) => `
    <p>Dear ${username}</p>

    <p>Click on the link below to verify your email</p>
    <br>
    <a href="${config.get('MAILER_HOST')}/verify-email?token=${token}">
      ${config.get('MAILER_HOST')}/verify-email?token=${token}
    </a>
  `,

  withdrawConfirmationEmail: (username, token, amount, currencySymbol, address) => `
    <p>Dear ${username}</p>
    <p>You have requested to withdraw ${amount} ${currencySymbol} to ${address}</p>
    <p>To confirm this withdrawal, click the following link</p>
    <br>
    <a href="${config.get('MAILER_HOST')}/confirm-withdrawal?token=${token}">
      ${config.get('MAILER_HOST')}/confirm-withdrawal?token=${token}
    </a>
  `
};

const sendResetPasswordEmail = function (username, email, token) {
  return sendMail(
    email,
    `${config.get('PROJECT_NAME')} | Reset your password`,
    templates.resetPassword(username, token)
  )
    .catch(logEmailErrors(email, 'reset password'));
};

const sendNewLoginEmail = function (username, ip, userAgent, email) {
  return sendMail(
    email,
    `${config.get('PROJECT_NAME')} | New Login`,
    templates.newLogin(username, ip, userAgent)
  )
    .catch(logEmailErrors(email, 'new login'));
};

const sendWelcomeEmail = function (username, email) {
  return sendMail(
    email,
    `${config.get('PROJECT_NAME')} | Welcome To ${config.get('PROJECT_NAME')}`,
    templates.welcomeEmail(username)
  )
    .catch(logEmailErrors(email, 'welcome'));
};

const sendVerificationEmail = function (username, email, token) {
  return sendMail(
    email,
    `${config.get('PROJECT_NAME')} | Verify your email`,
    templates.verificationEmail(username, token)
  )
    .catch(logEmailErrors(email, 'verify email'));
};

const sendWithdrawConfirmationEmail = function (username, email, token, currencySymbol, amount, address) {
  return sendMail(
    email,
    `${config.get('PROJECT_NAME')} | Verify your withdrawal of ${amount} ${currencySymbol}`,
    templates.withdrawConfirmationEmail(username, token, amount, currencySymbol, address)
  )
    .catch(logEmailErrors(email, 'withdrawal confirmation'));
};

module.exports = {
  sendResetPasswordEmail,
  sendNewLoginEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendWithdrawConfirmationEmail
};
