const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const uuid = require('uuid');
const db = require('../db');
const {notificationEmitter} = require('./notificationEmitter');
const {chatNotificationEmitter} = require('./chatNotificationEmitter');
const {attachCurrentUserToRequest} = require('../middleware');

const NotificationsHandler = require('./NotificationsHandler');
const ChatNotificationsHandler = require('./ChatNotificationsHandler');
const ChatService = require('../chat/ChatService');
const UserNotificationService = require('../notifications/UserNotificationService');

const chat = new ChatService(db.chat);
const userNotificationService = new UserNotificationService(db.notifications);

const socketErrorHandler = (socket) => async (error) => {
  const userId = socket.request.currentUser && socket.request.currentUser.id;
  const query = error.query ? error.query.toString() : null;
  const code = error.code || null;
  const source = error.DB_ERROR ? 'DB_ERROR' : 'SOCKET_ERROR';

  await db.logs.logError(error.message, error.stack, socket.request.id, userId, source, query, code);

  console.log(source, error);
};

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

  io.use(function (socket, next) {
    socket.request.id = uuid.v4();
    next();
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
      chat.joinChat(data.language, socket.id, currentUsername)
        .catch(socketErrorHandler(socket));
    });
    socket.on('newChatMessage', (data) => {
      chat.newChatMessage(data.language, data.message, currentUsername, currentUserId)
        .catch(socketErrorHandler(socket));
    });
    socket.on('banUser', (data) => {
      chat.banUser(data.username, currentUsername, currentUserId)
        .catch(socketErrorHandler(socket));
    });
    socket.on('unBanUser', (data) => {
      chat.unBanUser(data.username, currentUsername, currentUserId)
        .catch(socketErrorHandler(socket));
    });
    socket.on('clearAllChat', (data) => {
      chat.clearAllChat(data.language, currentUsername, currentUserId)
        .catch(socketErrorHandler(socket));
    });
    socket.on('clearUsersChat', (data) => {
      chat.clearUsersChat(data.username, currentUsername, currentUserId)
        .catch(socketErrorHandler(socket));
    });
    socket.on('privateChatMessage', function (data) {
      chat.privateChatMessage(currentUsername, currentUserId, data.toUsername, data.toUserId, data.message)
        .catch(socketErrorHandler(socket));
    });
    socket.on('joinPrivateChat', function () {
      chat.joinPrivateChat(currentUsername, currentUserId)
        .catch(socketErrorHandler(socket));
    });
    socket.on('joinPrivateChatWithUser', function (data) {
      chat.getLastPrivateChatsForUser(currentUsername, currentUserId, data.username)
        .catch(socketErrorHandler(socket));
    });
    socket.on('markPrivateChatAsRead', function (data) {
      chat.markPrivateChatAsRead(currentUsername, data.username)
        .catch(socketErrorHandler(socket));
    });
    socket.on('archiveConversation', function (data) {
      chat.archiveConversation(currentUsername, data.username)
        .catch(socketErrorHandler(socket));
    });
    socket.on('archiveAllConversations', function () {
      chat.archiveAllConversations(currentUsername)
        .catch(socketErrorHandler(socket));
    });
    socket.on('fetchNotifications', function () {
      userNotificationService.fetchNotifications(currentUserId)
        .catch(socketErrorHandler(socket));
    });
    socket.on('markNotificationAsRead', function ({id}) {
      userNotificationService.markNotificationAsRead(currentUserId, id);
    });
    socket.on('disconnect', function () {
      if (currentUserId) {
        chat.userLeaveApp(currentUsername)
          .catch(socketErrorHandler(socket));
      } else {
        chat.anonymousUserLeaveApp()
          .catch(socketErrorHandler(socket));
      }
    });
    socket.on('error', function (e) {
      console.log('CAUGHT', e);
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
    userNotificationService.handle(notification);
    notificationsHandler.handle(notification);
  });

  chatNotificationEmitter.addListener((notification) => {
    chatNotificationsHandler.handle(notification);
  });
};

module.exports = startSocketServer;
