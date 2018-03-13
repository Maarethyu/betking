module.exports = (db) => {
  const addNotification = async (userId, title, body) => {
    let result = {};
    await db.tx(t => {
      return t.one(`
        INSERT into user_notifications
        (user_id, title, body)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [userId, title, body])
        .then(res => {
          result = res;
          return t.none(`
            DELETE FROM user_notifications
            WHERE id IN (
            SELECT id
            FROM user_notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            OFFSET 5
            )`,
            [userId]);
        });
    });
    return result;
  };

  const fetchNotifications = async (userId) => {
    const result = await db.any('SELECT * from user_notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result;
  };

  const markNotificationAsRead = async (id) => {
    await db.none('UPDATE user_notifications SET is_read = $1 WHERE id = $2', [true, id]);
  };

  return {
    addNotification,
    fetchNotifications,
    markNotificationAsRead
  };
};
