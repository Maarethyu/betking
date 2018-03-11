module.exports = (db) => {
  const addChatMessage = async (username, userId, message, language, date) => {
    await db.none('INSERT INTO chats (username, user_id, message, language, date) VALUES ($1, $2, $3, $4, $5)', [username, userId, message, language, date]);
  };

  const getLastChatMessages = async (language, limit) => {
    const result = db.any('SELECT * from chats WHERE language = $1 AND is_hidden = false ORDER BY date DESC LIMIT $2', [language, limit]);
    return result;
  };

  const banUser = async (username, moderatorName) => {
    await db.none('INSERT INTO banned_users (username, banned_by, banned_date, is_banned) VALUES ($1, $2, NOW(), true) ON CONFLICT (username) DO UPDATE SET is_banned = true, banned_by = $2, banned_date = NOW()', [username, moderatorName]);
  };

  const unBanUser = async (username, moderatorName) => {
    await db.none('UPDATE banned_users SET unbanned_by = $1, unbanned_date = NOW(), is_banned = false WHERE username = $2', [moderatorName, username]);
  };

  const getAllBannedUsers = async () => {
    const result = db.any('SELECT username FROM banned_users WHERE is_banned = true');
    return result;
  };

  const getModerators = async () => {
    const result = db.any('SELECT username FROM moderators');
    return result;
  };

  const clearAllChat = async (language) => {
    await db.none('UPDATE chats SET is_hidden = true WHERE language = $1', language);
  };

  const clearUsersChat = async (username) => {
    await db.none('UPDATE chats SET is_hidden = true WHERE username = $1', username);
  };

  const ignoreUser = async (userId, ignoredUsername) => {
    await db.none('UPDATE users SET ignored_users = ignored_users || ARRAY[$1] WHERE id = $2 AND NOT($1 = ANY (ignored_users))', [ignoredUsername, userId]);
  };

  const unIgnoreUser = async (userId, unIgnoredUsername) => {
    await db.none('UPDATE users SET ignored_users = array_remove(ignored_users, $1) WHERE id = $2', [unIgnoredUsername, userId]);
  };

  const addPrivateMessage = async (fromUsername, fromUserId, toUsername, toUserId, message) => {
    const result = await db.one(`
      INSERT INTO private_chats
      (from_username, from_user_id, to_username, to_user_id, message)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [fromUsername, fromUserId, toUsername, toUserId, message]);

    return result;
  };

  const markPrivateChatAsRead = async (fromUsername, requesterName) => {
    await db.none(`
      UPDATE private_chats
      SET is_read = true
      WHERE from_username = $1 AND to_username = $2
    `, [fromUsername, requesterName]);
  };

  const archiveConversation = async (requesterName, otherUsername) => {
    await db.none(`
      UPDATE private_chats
      SET archived_by = archived_by || ARRAY[$1]
      WHERE id IN (
        SELECT id FROM private_chats
        WHERE (from_username = $1 AND to_username = $2) OR (from_username = $2 AND to_username = $1)
      ) AND (archived_by IS NULL OR NOT ($1) = ANY(archived_by))
    `, [requesterName, otherUsername]);
  };

  const archiveAllConversations = async (requesterName) => {
    await db.none(`
      UPDATE private_chats
      SET archived_by = archived_by || ARRAY[$1]
      WHERE id IN (
        SELECT MAX(id) AS id FROM ((
          SELECT from_username as username, id FROM private_chats
          WHERE from_username = $1 OR to_username = $1
        ) UNION ALL (
          SELECT to_username as username, id FROM private_chats
          WHERE from_username = $1 OR to_username = $1
        )) as union_users
        GROUP BY username
      ) AND (archived_by IS NULL OR NOT ($1) = ANY(archived_by))
    `, requesterName);
  };

  const fetchLastConversations = async (username) => {
    const privateChatMessages = await db.any(`
      SELECT * from private_chats
      WHERE id IN (
        SELECT MAX(id) AS id FROM ((
          SELECT from_username as username, id FROM private_chats
          WHERE from_username = $1 OR to_username = $1
        ) UNION ALL (
          SELECT to_username as username, id FROM private_chats
          WHERE from_username = $1 OR to_username = $1
        )) as union_users
        GROUP BY username
      )
      AND (archived_by IS NULL OR NOT ($1) = ANY(archived_by))
      ORDER BY date DESC
    `, username);

    const otherUsernames = privateChatMessages.map(chat => {
      if (chat.from_username === username) {
        return chat.to_username;
      } else {
        return chat.from_username;
      }
    });

    const unreadCounts = await db.any(`
      SELECT COUNT(id) as unread_count, from_username
      FROM private_chats
      WHERE from_username = ANY($1) AND to_username = $2 AND is_read = false
      GROUP BY from_username
    `, [otherUsernames, username]);

    return privateChatMessages.map(message => {
      let unreadCount = 0;

      unreadCounts.forEach(count => {
        if (message.from_username === count.from_username || message.to_username === count.from_username) {
          unreadCount = parseInt(count.unread_count, 10);
        }
      });

      return {
        fromUsername: message.from_username,
        toUsername: message.to_username,
        fromUserId: message.from_user_id,
        toUserId: message.to_user_id,
        message: message.message,
        unreadCount
      };
    });
  };

  const getLastPrivateChatsForUser = async (username1, username2, limit) => {
    const results = await db.any(`
      SELECT * from private_chats
      WHERE (to_username = $1 AND from_username = $2) OR (to_username = $2 AND from_username = $1)
      ORDER BY date DESC
      LIMIT $3
    `, [username1, username2, limit]);

    return results.map(item => ({
      fromUsername: item.from_username,
      fromUserId: item.fromUserId,
      toUsername: item.to_username,
      toUserId: item.to_user_id,
      message: item.message,
      date: item.date,
      isRead: item.is_read
    }));
  };

  const toggleDisplayHighrollersInChat = async (userId, showHighrollers) => {
    await db.none('UPDATE users SET show_highrollers_in_chat = $1 WHERE id = $2', [showHighrollers, userId]);
  };

  return {
    addChatMessage,
    getLastChatMessages,
    banUser,
    unBanUser,
    getAllBannedUsers,
    getModerators,
    clearAllChat,
    clearUsersChat,
    ignoreUser,
    unIgnoreUser,
    addPrivateMessage,
    markPrivateChatAsRead,
    archiveConversation,
    archiveAllConversations,
    fetchLastConversations,
    getLastPrivateChatsForUser,
    toggleDisplayHighrollersInChat
  };
};
