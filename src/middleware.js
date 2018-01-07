const db = require('./db');

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

module.exports.attachCurrentUserToRequest = attachCurrentUserToRequest;
module.exports.requireLoggedIn = requireLoggedIn;
