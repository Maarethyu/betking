const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const {notificationEmitter} = require('./notificationEmitter');
const {attachCurrentUserToRequest} = require('../middleware');

const NotificationsHandler = require('./NotificationsHandler');

const startSocketServer = function (server, cache) {
  const io = socketIo.listen(server);
  const notificationsHandler = new NotificationsHandler(io);
  const {betsCache} = cache;

  console.log(`websockets listening`);

  io.use(function (socket, next) {
    cookieParser()(socket.request, null, next);
  });

  io.use(function (socket, next) {
    attachCurrentUserToRequest(socket.request, null, next);
  });

  io.on('connection', function (socket) {
    // const currentUser = socket.request.currentUser;
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
};

module.exports = startSocketServer;
