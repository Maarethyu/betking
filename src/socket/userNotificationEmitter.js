const BaseEventEmitter = require('events');

const types = {
  DEPOSIT_CONFIRMED: 'depositConfirmed'
};

class UserNotificationEmitter extends BaseEventEmitter {
  emit (type, payload) {
    super.emit(type, {type, payload});
  }

  addListener (listener) {
    Object.keys(types).forEach(key => {
      super.addListener(types[key], listener);
    });
  }
}

const userNotificationEmitter = new UserNotificationEmitter();

module.exports = {
  userNotificationEmitter,
  types
};
