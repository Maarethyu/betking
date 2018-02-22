const htmlencode = require('htmlencode');
const ChatCache = require('./ChatCache');
const {chatNotificationEmitter, types} = require('../socket/chatNotificationEmitter');

const removeUnicode = (content) => content.replace(/[^\x00-\x7F]/g, ''); // eslint-disable-line no-control-regex

const truncateAndTrim = (content) => content.slice(0, 255).trim();

class ChatService {
  constructor (db) {
    this.cache = new ChatCache(db);
  }

  async joinChat (language, connectionId, requesterName) {
    const isModerator = await this.cache.isUserModerator(requesterName);
    const messages = await this.cache.lastMessages(language, requesterName);
    const moderators = await this.cache.getModerators();
    chatNotificationEmitter.emit(types.CHAT_MESSAGES, {
      language: language || 'EN',
      id: connectionId,
      messages,
      users: this.cache.users.users(),
      anonymousUsers: this.cache.users.anonymous,
      moderators,
      isModerator,
      bannedUsernames: isModerator ? await this.cache.getBannedUsernames() : []
    });
  }

  async newChatMessage (language, content, username, userId) {
    const contentProcessed = htmlencode.htmlEncode(truncateAndTrim(removeUnicode(content)));

    if (contentProcessed.length > 0) {
      const result = await this.cache.addMessage(username, userId, contentProcessed, language);
      chatNotificationEmitter.emit(types.NEW_CHAT_MESSAGE, {
        language,
        message: result
      });
    }
  }

  userJoinApp (username) {
    if (!this.cache.containsUser(username)) {
      chatNotificationEmitter.emit(types.CHAT_NEW_USER, {
        username
      });
    }

    this.cache.addUser(username);
  }

  anonymousUserJoinApp () {
    this.cache.addAnonymousUser();

    chatNotificationEmitter.emit(types.CHAT_ANONYMOUS_USER_COUNT, {
      count: this.cache.anonymousCount()
    });
  }

  userLeaveApp (username) {
    this.cache.removeUser(username);

    if (!this.cache.containsUser(username)) {
      chatNotificationEmitter.emit(types.CHAT_DELETED_USER, {
        username
      });
    }
  }

  anonymousUserLeaveApp () {
    this.cache.removeAnonymousUser();

    chatNotificationEmitter.emit(types.CHAT_ANONYMOUS_USER_COUNT, {
      count: this.cache.anonymousCount()
    });
  }

  async banUser (username, moderatorName, moderatorId) {
    const isModerator = await this.cache.isUserModerator(moderatorName);
    if (isModerator) {
      await this.cache.banUser(username, moderatorName);

      chatNotificationEmitter.emit(types.CHAT_BANNED_USER, {
        username,
        moderatorId
      });
    } else {
      chatNotificationEmitter.emit(types.CHAT_BANNED_USER, {
        error: 'You need to be a chat moderator to ban user',
        moderatorId
      });
    }
  }

  async unBanUser (username, moderatorName, moderatorId) {
    const isModerator = await this.cache.isUserModerator(moderatorName);
    if (isModerator) {
      await this.cache.unBanUser(username, moderatorName);

      chatNotificationEmitter.emit(types.CHAT_UNBANNED_USER, {
        username,
        moderatorId
      });
    } else {
      chatNotificationEmitter.emit(types.CHAT_UNBANNED_USER, {
        error: 'You need to be a chat moderator to unban user',
        moderatorId
      });
    }
  }

  async clearAllChat (language, moderatorName, moderatorId) {
    const isModerator = await this.cache.isUserModerator(moderatorName);

    if (isModerator) {
      await this.cache.clearAllChat(language);

      chatNotificationEmitter.emit(types.CLEAR_ALL_CHAT, {
        language
      });
    } else {
      chatNotificationEmitter.emit(types.CLEAR_ALL_CHAT, {
        error: 'You need to be a moderator to clear all chat',
        moderatorId
      });
    }
  }

  async clearUsersChat (language, username, moderatorName, moderatorId) {
    const isModerator = await this.cache.isUserModerator(moderatorName);

    if (isModerator) {
      await this.cache.clearUsersChat(language, username);

      chatNotificationEmitter.emit(types.CLEAR_USERS_CHAT, {
        language,
        username
      });
    } else {
      chatNotificationEmitter.emit(types.CLEAR_USERS_CHAT, {
        error: 'You need to be a moderator to clear user\'s chat',
        moderatorId
      });
    }
  }
}

module.exports = ChatService;
