const request = require('request-promise');
const config = require('config');

const sendMail = function (To, Subject, HtmlBody) {
  return request({
    uri: 'https://api.postmarkapp.com/email',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': config.get('MAILER_SERVER_TOKEN')
    },
    body: JSON.stringify({From: config.get('MAILER_SENDER_EMAIL'), To, Subject, HtmlBody})
  });
};

const logEmailErrors = (toEmail, info) => (e) => {
  console.log(`Sending ${info} email from ${config.get('MAILER_SENDER_EMAIL')} to ${toEmail} failed`, e);
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
    <h2>BetKing Login</h2>
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
    <p>BetKing Team</p>
  `,

  welcomeEmail: (username) => `
    <p>Dear ${username}</p>

    <p>Welcome to BetKing!</p>
  `,
};

const sendResetPasswordEmail = function (username, token, email) {
  return sendMail(
    email,
    'BetKing | Reset your password',
    templates.resetPassword(username, token)
  )
    .catch(logEmailErrors(email, 'reset password'));
};

const sendNewLoginEmail = function (username, ip, userAgent, email) {
  return sendMail(
    email,
    'BetKing | New Login',
    templates.newLogin(username, ip, userAgent)
  )
    .catch(logEmailErrors(email, 'new login'));
};

const sendWelcomeEmail = function (username, email) {
  return sendMail(
    email,
    'BetKing | Welcome To BetKing',
    templates.welcomeEmail(username)
  )
    .catch(logEmailErrors(email, 'welcome'));
};

module.exports = {
  sendResetPasswordEmail,
  sendNewLoginEmail,
  sendWelcomeEmail,
};
