class UserNotificationsHandler {
  constructor (io) {
    this.io = io;
  }

  handle (notification) {
    if (this[notification.type]) {
      this[notification.type](notification.type, notification.payload);
    }
  }

  depositConfirmed (type, payload) {
    this.io.to(payload.userId).emit(type, payload);
  }
}

module.exports = UserNotificationsHandler;
