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
    const body = ` <p>Deposit of ${payload.amount} ${payload.symbol} has been credited in your account.`;

    await this.db.addNotification(payload.userId, title, body);
  }
}

module.exports = UserNotificationService;
