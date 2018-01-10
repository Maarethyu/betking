const getIp = function (req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

const getFp = function (req) {
  return req.body && typeof req.body.fingerprint === 'string' ? req.body.fingerprint : 'unknown';
};

const getUa = function (req) {
  return req.headers['user-agent'];
}

module.exports = {
  getIp,
  getFp,
  getUa
};
