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
  isValidUuid
};
