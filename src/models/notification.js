module.exports = (db) => {
  const addNotification = async (userId, title, body) => {
    await db.tx(t => {
      return t.none(`
        INSERT into user_notifications
        (user_id, body, title)
        VALUES ($1, $2, $3)`,
        [userId, title, body])
        .then(res => {
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
  };

  return {
    addNotification
  };
};
