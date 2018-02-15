const BaseEventEmitter = require('events');

const types = {
  DICE_BET: 'diceBet',
  TOGGLE_STATS_HIDDEN: 'toggleStatsHidden'
};

class EventEmitter extends BaseEventEmitter {
  emit (type, payload) {
    super.emit(type, {type, payload});
  }

  addListener (listener) {
    Object.keys(types).forEach(key => {
      super.addListener(types[key], listener);
    });
  }
}

const eventEmitter = new EventEmitter();

module.exports = {
  eventEmitter,
  types
};
