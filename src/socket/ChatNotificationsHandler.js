class ChatNotificationsHandler {
  constructor (io) {
    this.io = io;
  }

  handle (notification) {
    if (this[notification.type]) {
      this[notification.type](notification.type, notification.payload);
    }
  }

  chatMessages (type, payload) {
    const content = {
      language: payload.language,
      messages: payload.messages,
      users: payload.users,
      anonymousUsers: payload.anonymousUsers,
      isModerator: payload.isModerator,
      bannedUsernames: payload.bannedUsernames,
      moderators: payload.moderators
    };

    this.io.to(payload.id).emit(type, content);
  }

  newChatMessage (type, payload) {
    const content = {
      message: payload.message,
      language: payload.language
    };

    if (payload.message.isBanned) {
      this.io.to(payload.message.userId).emit(type, content);
    } else {
      this.io.emit(type, content);
    }
  }

  chatAnonymousUserCount (type, payload) {
    this.io.emit(type, payload);
  }

  chatNewUser (type, payload) {
    this.io.emit(type, payload);
  }

  chatDeletedUser (type, payload) {
    this.io.emit(type, payload);
  }

  chatBannedUser (type, payload) {
    if (payload.error) {
      this.io.to(payload.moderatorId).emit('showError', payload.error);
      return;
    }

    const content = {username: payload.username};
    this.io.to(payload.moderatorId).emit(type, content);
  }

  chatUnbannedUser (type, payload) {
    if (payload.error) {
      this.io.to(payload.moderatorId).emit('showError', payload.error);
      return;
    }

    const content = {username: payload.username};
    this.io.to(payload.moderatorId).emit(type, content);
  }

  clearAllChat (type, payload) {
    if (payload.error) {
      this.io.to(payload.moderatorId).emit('showError', payload.error);
      return;
    }

    const content = {language: payload.language};
    this.io.to('public').emit(type, content);
  }

  clearUsersChat (type, payload) {
    if (payload.error) {
      this.io.to(payload.moderatorId).emit('showError', payload.error);
      return;
    }

    const content = {username: payload.username};
    this.io.to('public').emit(type, content);
  }

  newPrivateMessage (type, payload) {
    this.io.to(payload.toUserId).emit(type, payload.chatMessage);
    this.io.to(payload.fromUserId).emit(type, payload.chatMessage);
  }

  privateChatMessages (type, payload) {
    this.io.to(payload.userId).emit(type, payload.chatUsers);
  }

  privateChatMessagesWithUser (type, payload) {
    this.io.to(payload.userId).emit(type, {messages: payload.messages, username: payload.otherUsername});
  }
}

module.exports = ChatNotificationsHandler;
