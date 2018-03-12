const OnlineUsers = require('./OnlineUsers');

class ChatCache {
  constructor (db) {
    this.db = db;
    this.messagesPerLanguage = [];
    this.users = new OnlineUsers();
    this.bannedUsers = [];
    this.moderators = [];
  }

  async lastMessages (language, requesterName) {
    const perLanguage = await this.listPerLanguage(language);
    const messages = this.shadowRemoveBannedMessages(perLanguage.messages, requesterName);
    return messages;
  }

  async addMessage (username, userId, message, language) {
    const date = new Date().toISOString();
    const bannedUsernames = await this.getBannedUsernames();

    const result = {
      userId,
      username,
      message,
      isBanned: bannedUsernames.indexOf(username) > -1,
      date
    };

    const perLanguage = await this.listPerLanguage(language);
    perLanguage.messages.push(result);

    if (perLanguage.messages.length > 100) {
      perLanguage.messages.splice(0, perLanguage.messages.length - 100);
    }

    await this.db.addChatMessage(username, userId, message, language, date);
    return result;
  }

  listPerLanguage (language = 'EN') {
    return new Promise(async (resolve, reject) => {
      const item = this.messagesPerLanguage.find(item => item.language === language);
      if (item) {
        resolve(item);
      } else {
        try {
          const messages = await this.db.getLastChatMessages(language, 100);
          const bannedUsernames = await this.getBannedUsernames();

          const newItem = {
            language,
            messages: messages.map(msg => ({
              userId: msg.user_id,
              username: msg.username,
              message: msg.message,
              isBanned: bannedUsernames.indexOf(msg.username) > -1,
              date: msg.date
            }))
          };

          this.messagesPerLanguage.push(newItem);
          resolve(newItem);
        } catch (e) {
          reject(e);
        }
      }
    });
  }

  shadowRemoveBannedMessages (messages, requesterName) {
    return messages.filter(msg => !msg.isBanned || (requesterName && msg.username === requesterName));
  }

  addAnonymousUser () {
    this.users.addAnonymousUser();
  }

  removeAnonymousUser () {
    this.users.removeAnonymousUser();
  }

  addUser (username) {
    this.users.addUser(username);
  }

  removeUser (username) {
    this.users.removeUser(username);
  }

  containsUser (username) {
    return this.users.containsUser(username);
  }

  anonymousCount () {
    return this.users.anonymous;
  }

  async updateBannedMessageInCache () {
    const bannedUsernames = await this.getBannedUsernames();

    this.messagesPerLanguage.forEach(item => {
      item.messages.forEach(msg => {
        msg.isBanned = bannedUsernames.indexOf(msg.username) > -1;
      });
    });
  }

  async banUser (username, moderatorName) {
    const bannedUsernames = await this.getBannedUsernames();
    const userAlreadyBanned = bannedUsernames.indexOf(username) > -1;

    if (!userAlreadyBanned) {
      this.bannedUsers.push(username);
    }

    await this.updateBannedMessageInCache();
    await this.db.banUser(username, moderatorName);
  }

  async unBanUser (username, moderatorName) {
    const bannedUsernames = await this.getBannedUsernames();

    const bannedUserIndex = bannedUsernames.indexOf(username);
    if (bannedUserIndex !== -1) {
      this.bannedUsers.splice(bannedUserIndex, 1);
    }

    await this.updateBannedMessageInCache();
    await this.db.unBanUser(username, moderatorName);
  }

  async isUserModerator (username) {
    const moderators = await this.getModerators();
    return moderators.indexOf(username) > -1;
  }

  async getBannedUsernames () {
    if (this.bannedUsers.length === 0) {
      const bannedUsers = await this.db.getAllBannedUsers();
      this.bannedUsers = bannedUsers.map(u => u.username);
    }
    return this.bannedUsers;
  }

  async getModerators () {
    if (this.moderators.length === 0) {
      const moderators = await this.db.getModerators();
      this.moderators = moderators.map(m => m.username);
    }

    return this.moderators;
  }

  async clearAllChat (language) {
    const itemIndex = this.messagesPerLanguage.findIndex(item => item.language === language);
    if (itemIndex !== -1) {
      this.messagesPerLanguage.splice(itemIndex, 1);
    }

    await this.db.clearAllChat(language);
  }

  async clearUsersChat (username) {
    this.messagesPerLanguage.forEach(item => {
      if (Array.isArray(item.messages)) {
        item.messages = item.messages.filter(message => message.username !== username);
      }
    });

    await this.db.clearUsersChat(username);
  }
}

module.exports = ChatCache;
