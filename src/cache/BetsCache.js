const helpers = require('../helpers');
const {notificationEmitter, types} = require('../socket/notificationEmitter');

class BetsCache {
  constructor (db) {
    this.db = db;

    this.allBets = [];
    this.highrollerBets = [];
    this.currencyToHighrollerAmounts = {};
    this.usernameToStatsHidden = {};

    this.numBetsInCache = 50;
  }

  async load () {
    const allBets = await this.db.getLatestDiceBets(this.numBetsInCache);
    const highrollerBets = await this.db.getLatestDiceHighrollerBets(this.numBetsInCache);

    this.buildStatsHiddenMapFromBetsPayload(allBets);
    this.buildStatsHiddenMapFromBetsPayload(highrollerBets);

    this.allBets = allBets.map(this.payloadToCacheBet);
    this.highrollerBets = highrollerBets.map(this.payloadToCacheBet);

    await this.loadHighrollerAmounts();
  }

  async loadHighrollerAmounts () {
    const bankrolls = await this.db.getAllBankrolls();
    bankrolls.forEach(b => {
      this.currencyToHighrollerAmounts[b.currency] = b.highroller_amount;
    });
  }

  buildStatsHiddenMapFromBetsPayload (betsPayload) {
    betsPayload.forEach(payload => {
      this.usernameToStatsHidden[payload.username] = payload.stats_hidden;
    });
  }

  payloadToCacheBet (payload) {
    return {
      id: payload.id,
      date: payload.date,
      bet_amount: payload.bet_amount,
      currency: payload.currency,
      profit: payload.profit,
      game_details: {
        roll: payload.game_details.roll,
        target: payload.game_details.target,
        chance: payload.game_details.chance
      },
      username: payload.username
    };
  }

  addBetToCache (betList, bet) {
    betList.splice(0, 0, bet);

    if (betList.length > this.numBetsInCache) {
      betList.splice(this.numBetsInCache);
    }
  }

  handle (event) {
    if (this[event.type]) {
      this[event.type](event.payload);
    }
  }

  // events

  diceBet (payload) {
    const bet = this.payloadToCacheBet(payload);
    this.buildStatsHiddenMapFromBetsPayload([payload]);

    const highrollerAmount = this.currencyToHighrollerAmounts[bet.currency];
    const isHighrollerBet = helpers.isHighrollerBet(bet.bet_amount, bet.profit, highrollerAmount);
    if (isHighrollerBet) {
      this.addBetToCache(this.highrollerBets, bet);
    }

    this.addBetToCache(this.allBets, bet);

    notificationEmitter.emit(types.DICE_BET, {
      bet,
      isHighrollerBet,
      statsHidden: payload.stats_hidden
    });
  }

  toggleStatsHidden (payload) {
    this.usernameToStatsHidden[payload.username] = payload.statsHidden;
  }

  loadBetsFor (loggedInUsername, socketId) {
    const allBets = helpers.maskUsernameFromBets(this.allBets, this.usernameToStatsHidden, loggedInUsername);
    const highrollerBets = helpers.maskUsernameFromBets(this.highrollerBets, this.usernameToStatsHidden, loggedInUsername);

    notificationEmitter.emit(types.LOAD_ALL_BETS, {
      socketId,
      allBets,
      highrollerBets
    });
  }
}

module.exports = BetsCache;
