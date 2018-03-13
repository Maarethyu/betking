const uuidV4 = require('uuid/v4');

const guestPrefix = 'guest';

module.exports = (db) => {
  const createToken = async (userId, username, isVip, isAdmin) => {
    const {token} = await db.one(`
      INSERT INTO cubeia_tokens
      (date, token, username, user_id, is_vip, is_admin)
      VALUES (NOW() + interval '5 minutes', $1, $2, $3, $4, $5)
      RETURNING token
    `, [uuidV4(), username, userId, isVip, isAdmin]);

    return token;
  };

  const deleteToken = async (id) => {
    await db.none('DELETE FROM cubeia_tokens WHERE id = $1', id);
  };

  const createAnonymousToken = async () => {
    const token = await createToken(`${guestPrefix}${uuidV4()}`, 'Guest', false, false);
    return token;
  };

  const tokenFor = async (userId, username, isVip, isAdmin) => {
    const existingToken = await db.oneOrNone(`
      SELECT id, date, token, username FROM cubeia_tokens WHERE user_id = $1
    `, [userId]);

    if (existingToken) {
      await deleteToken(existingToken.id);
    }

    const token = await createToken(userId, username, isVip, isAdmin);
    return token;
  };

  const tokenForAnonymous = async () => {
    const token = await createAnonymousToken();
    return token;
  };

  const getUserFor = async (token) => {
    const result = await db.oneOrNone(`
      SELECT id, user_id, date, username, is_vip, is_admin
      FROM cubeia_tokens
      WHERE token = $1 AND date > NOW()
    `);

    if (result) {
      return {
        id: result.user_id,
        username: result.username,
        userAttributes: {
          VIP: result.is_vip.toString(),
          admin: result.is_admin.toString(),
          notguest: (!result.user_id.startsWith(guestPrefix)).toString()
        }
      };
    }

    return null;
  };

  const saveRequest = async (requestId, request, response, type) => {
    await db.none(`
      INSERT INTO cubeia_requests
      (date, request_id, request, response, type)
      VALUES (NOW(), $1, $2, $3, $4)
    `, [requestId, request, response, type]);
  };

  const getResponse = async (requestId) => {
    const result = await db.oneOrNone(`
      SELECT id, response FROM cubeia_requests WHERE request_id = $1
    `, requestId);

    if (result) {
      return result.response;
    }

    return null;
  };

  const getRequest = async (requestId) => {
    const result = await db.one(`
      SELECT id, type, request, response FROM cubeia_requests WHERE request_id = $1
    `, requestId);

    return result;
  };

  const addRequestProcessed = async (requestId, balance) => {
    await db.none(`
      INSERT INTO cubeia_requests_processed
      (date, request_id, balance)
      VALUES (NOW(), $1, $2)
    `, [requestId, balance]);
  };

  const getRequestProcessed = async (requestId) => {
    const result = await db.oneOrNone(`
      SELECT id, balance FROM cubeia_requests_processed WHERE request_id = $1
    `, requestId);

    if (result) {
      return result.balance;
    }

    return null;
  };

  const isUserSetAsVip = async (userId) => {
    const {is_vip: isVip} = await db.one('SELECT is_vip FROM users WHERE id = $1', userId);

    return isVip;
  };

  const toggleVipStatus = async (userId, isVip) => {
    await db.none('UPDATE users SET is_vip = $1 WHERE id = $2', [isVip, userId]);
  };

  return {
    createToken,
    deleteToken,
    createAnonymousToken,
    tokenFor,
    tokenForAnonymous,
    getUserFor,
    saveRequest,
    getResponse,
    getRequest,
    addRequestProcessed,
    getRequestProcessed,
    isUserSetAsVip,
    toggleVipStatus
  };
};
