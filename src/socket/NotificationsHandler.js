const config = require('config');
const BigNumber = require('bignumber.js');

class NotificationsHandler {
  constructor (io) {
    this.io = io;
    this.betThrottleDelay = config.get('BET_THROTTLE_DELAY_MS');

    this.lastBetBroadcast = null;
    this.throttledBet = {
      username: null,
      bet: null
    };
  }

  handle (notification) {
    if (this[notification.type]) {
      this[notification.type](notification.type, notification.payload);
    }
  }

  loadAllBets (type, payload) {
    this.io
      .of('/watch-bets')
      .to(payload.socketId)
      .emit(type, {
        allBets: payload.allBets,
        highrollerBets: payload.highrollerBets
      });
  }

  diceBet (type, payload) {
    const bet = {...payload.bet, isHighrollerBet: payload.isHighrollerBet};

    let username = bet.username;
    if (payload.statsHidden) {
      username = '[HIDDEN]';
    }

    const maskedBet = Object.assign({}, bet, {username});

    if (maskedBet.isHighrollerBet) {
      this.io
        .of('/watch-bets')
        .to(bet.username)
        .emit(type, bet);

      this.io
        .of('/watch-bets')
        .emit(type, maskedBet);

      return;
    }

    if (!this.lastBetBroadcast || Math.abs(new Date(bet.date) - this.lastBetBroadcast) >= this.betThrottleDelay) {
      if (!this.throttledBet.bet) {
        this.throttledBet.bet = maskedBet;
        this.throttledBet.username = bet.username;
      }

      this.io
        .of('/watch-bets')
        .to(this.throttledBet.username)
        .emit(type, Object.assign({}, this.throttledBet.bet, {username: this.throttledBet.username}));

      this.io
        .of('/watch-bets')
        .emit(type, this.throttledBet.bet);

      this.throttledBet.bet = null;
      this.throttledBet.username = null;
      this.lastBetBroadcast = new Date();
    } else {
      if (!this.throttledBet.bet ||
        (new BigNumber(maskedBet.bet_amount).gt(this.throttledBet.bet.bet_amount) ||
        new BigNumber(maskedBet.profit).gt(this.throttledBet.bet.profit))
      ) {
        this.throttledBet.bet = maskedBet;
        this.throttledBet.username = bet.username;
      }
    }
  }
}

module.exports = NotificationsHandler;
