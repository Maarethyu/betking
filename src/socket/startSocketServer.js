const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const {attachCurrentUserToRequest} = require('../middleware');

const startSocketServer = function (server) {
  const io = socketIo.listen(server);
  console.log(`websockets listening`);

  io.use(function (socket, next) {
    cookieParser()(socket.request, null, next);
  });

  io.use(function (socket, next) {
    attachCurrentUserToRequest(socket.request, null, next);
  });

  io.on('connection', function (socket) {
    console.log(socket.request.currentUser);
  });
};

module.exports = startSocketServer;
