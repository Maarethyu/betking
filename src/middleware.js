const db = require('./db');
const helpers = require('./helpers');

const attachCurrentUserToRequest = async (req, res, next) => {
  const sessionId = req.cookies.session;
  // validate sessionid is uuid

  if (sessionId) {
    const user = await db.getUserBySessionId(sessionId);
    if (user) {
      req.currentUser = user; // TODO don't show exact one
    }
  }

  next();
};

const requireLoggedIn = async (req, res, next) => {
  if (!req.currentUser) {
    // this should maybe return login url?
    res.status(401).send('Unauthorized');
    return; // should this be here? do we need   res.end();?
    // throw new Error('Requires logged in user');
  }

  next();
};

const require2fa = async (req, res, next) => {
  if (req.currentUser.mfa_key) {
    /* If user has 2fa enabled, check if req.body.otp is valid */
    const isOtpValid = helpers.isOtpValid(req.currentUser.mfa_key, req.body.otp);

    if (isOtpValid) {
      try {
        await db.insertTwoFactorCode(req.body.otp);
        next();
      } catch (e) {
        if (e.message === 'CODE_ALREADY_USED') {
          res.status(400).send('You have used this two factor code recently. Wait until it refreshes (30 seconds usually)');
        } else {
          throw e;
        }
      }
    } else {
      res.status(400).send('Invalid two factor code');
    }

    return;
  }

  next();
};

module.exports.attachCurrentUserToRequest = attachCurrentUserToRequest;
module.exports.requireLoggedIn = requireLoggedIn;
module.exports.require2fa = require2fa;
