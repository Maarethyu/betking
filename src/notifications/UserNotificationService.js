const {notificationEmitter, types} = require('../socket/notificationEmitter');

class UserNotificationService {
  constructor (db) {
    this.db = db;
  }

  handle (notification) {
    if (this[notification.type]) {
      this[notification.type](notification.type, notification.payload);
    }
  }

  async depositConfirmed (type, payload) {
    const title = 'Deposit confirmed.';
    const body = ` <p>Deposit of ${payload.amount} ${payload.symbol} has been credited in your account.</p>`;

    const result = await this.db.addNotification(payload.userId, title, body);
    notificationEmitter.emit(types.NEW_NOTIFICATION, {
      notification: result,
      userId: payload.userId
    });
  }

  async fetchNotifications (userId) {
    const notifications = await this.db.fetchNotifications(userId);
    notificationEmitter.emit(types.ALL_NOTIFICATIONS, {
      notifications,
      userId
    });
  }

  async markNotificationAsRead (userId, notificationId) {
    await this.db.markNotificationAsRead(notificationId);
    notificationEmitter.emit(types.MARKED_NOTIFICATION_AS_READ, {
      userId,
      notificationId
    });
  }
}

module.exports = UserNotificationService;
