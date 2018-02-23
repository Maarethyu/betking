const BaseEventEmitter = require('events');

const types = {
  CHAT_MESSAGES: 'chatMessages',
  NEW_CHAT_MESSAGE: 'newChatMessage',
  CHAT_NEW_USER: 'chatNewUser',
  CHAT_DELETED_USER: 'chatDeletedUser',
  CHAT_ANONYMOUS_USER_COUNT: 'chatAnonymousUserCount',
  CHAT_BANNED_USER: 'chatBannedUser',
  CHAT_UNBANNED_USER: 'chatUnbannedUser',
  CLEAR_ALL_CHAT: 'clearAllChat',
  CLEAR_USERS_CHAT: 'clearUsersChat'
};

class ChatNotificationEmitter extends BaseEventEmitter {
  emit (type, payload) {
    super.emit(type, {type, payload});
  }

  addListener (listener) {
    Object.keys(types).forEach(key => {
      super.addListener(types[key], listener);
    });
  }
}

const chatNotificationEmitter = new ChatNotificationEmitter();

module.exports = {
  chatNotificationEmitter,
  types
};
