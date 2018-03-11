module.exports = (db) => {
  const addSupportTicket = async (name, email, message, userId) => {
    const result = await db.one('INSERT INTO support_tickets (name, email, message, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id', [name, email, message, 'open', userId]);

    return result;
  };

  const getSupportTicketsForUser = async (userId, limit, skip) => {
    const results = await db.any('SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3', [userId, limit, skip]);
    const {count} = await db.one('SELECT COUNT(*) FROM support_tickets WHERE user_id = $1', userId);

    return {results, count};
  };

  return {
    addSupportTicket,
    getSupportTicketsForUser
  };
};
