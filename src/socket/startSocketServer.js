const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const db = require('../db');
const {notificationEmitter} = require('./notificationEmitter');
const {chatNotificationEmitter} = require('./chatNotificationEmitter');
const {attachCurrentUserToRequest} = require('../middleware');

const NotificationsHandler = require('./NotificationsHandler');
const ChatNotificationsHandler = require('./ChatNotificationsHandler');
const ChatService = require('../chat/ChatService');

const chat = new ChatService(db);

const startSocketServer = function (server, cache) {
  const io = socketIo.listen(server);
  const notificationsHandler = new NotificationsHandler(io);
  const chatNotificationsHandler = new ChatNotificationsHandler(io);
  const {betsCache} = cache;

  console.log(`websockets listening`);

  io.use(function (socket, next) {
    cookieParser()(socket.request, null, next);
  });

  io.use(function (socket, next) {
    attachCurrentUserToRequest(socket.request, null, next);
  });

  io.on('connection', function (socket) {
    const currentUser = socket.request.currentUser;
    const currentUserId = currentUser && currentUser.id;
    const currentUsername = currentUser && currentUser.username;

    socket.join('public');
    if (currentUserId) {
      socket.join(currentUserId);
      socket.join(currentUsername);
      chat.userJoinApp(currentUsername);
    } else {
      chat.anonymousUserJoinApp();
    }

    socket.on('joinChat', (data) => {
      chat.joinChat(data.language, socket.id, currentUsername);
    });
    socket.on('newChatMessage', (data) => {
      chat.newChatMessage(data.language, data.message, currentUsername, currentUserId);
    });
    socket.on('banUser', (data) => {
      chat.banUser(data.username, currentUsername, currentUserId);
    });
    socket.on('unBanUser', (data) => {
      chat.unBanUser(data.username, currentUsername, currentUserId);
    });
    socket.on('clearAllChat', (data) => {
      chat.clearAllChat(data.language, currentUsername, currentUserId);
    });
    socket.on('clearUsersChat', (data) => {
      chat.clearUsersChat(data.username, currentUsername, currentUserId);
    });
    socket.on('privateChatMessage', function (data) {
      chat.privateChatMessage(currentUsername, currentUserId, data.toUsername, data.toUserId, data.message);
    });
    socket.on('joinPrivateChat', function () {
      chat.joinPrivateChat(currentUsername, currentUserId);
    });
    socket.on('joinPrivateChatWithUser', function (data) {
      chat.getLastPrivateChatsForUser(currentUsername, currentUserId, data.username);
    });
    socket.on('markPrivateChatAsRead', function (data) {
      chat.markPrivateChatAsRead(currentUsername, data.username);
    });
    socket.on('archiveConversation', function (data) {
      chat.archiveConversation(currentUsername, data.username);
    });
    socket.on('archiveAllConversations', function () {
      chat.archiveAllConversations(currentUsername);
    });
    socket.on('disconnect', function () {
      if (currentUserId) {
        chat.userLeaveApp(currentUsername);
      } else {
        chat.anonymousUserLeaveApp();
      }
    });
  });

  io.of('/watch-bets').on('connection', function (socket) {
    const currentUserName = socket.request.currentUser && socket.request.currentUser.username;

    if (currentUserName) {
      socket.join(currentUserName);
    }

    socket.on('loadBets', () => {
      betsCache.loadBetsFor(currentUserName, socket.id);
    });
  });

  notificationEmitter.addListener((notification) => {
    notificationsHandler.handle(notification);
  });

  chatNotificationEmitter.addListener((notification) => {
    chatNotificationsHandler.handle(notification);
  });
};

module.exports = startSocketServer;
