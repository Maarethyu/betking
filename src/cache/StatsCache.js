const config = require('config');
const BigNumber = require('bignumber.js');
const {notificationEmitter, types} = require('../socket/notificationEmitter');

class StatsCache {
  constructor (db) {
    this.db = db;

    this.totalBets = 0;
    this.siteStats = [];
    this.wonLast24Hours = [];

    this.lastComputedWon24Hours = null;
    this.cacheDurationWonLast24Hours = config.get('CACHE_DURATION_WON_LAST_24H_MS');
  }

  async load () {
    const betStatsByCurrency = await this.db.bets.getBetStatsByCurrency();

    this.totalBets = this.totalBetsFromStats(betStatsByCurrency);
    this.siteStats = this.siteStatsFromStats(betStatsByCurrency);
    await this.getWonLast24Hours();
  }

  totalBetsFromStats (stats) {
    return stats.reduce((numBets, stat) => {
      const sumBets = new BigNumber(numBets)
        .add(stat.num_bets)
        .toNumber();

      return sumBets;
    }, 0);
  }

  siteStatsFromStats (stats) {
    return stats.map(stat => ({
      currency: stat.currency,
      wagered: stat.sum_bet_amount,
      profit: new BigNumber(stat.sum_profit)
        .times(-1)
        .toString(),
      numBets: new BigNumber(stat.num_bets)
        .toNumber()
    }));
  }

  async getWonLast24Hours () {
    if (!this.lastComputedWon24Hours ||
      (Date.now() - this.lastComputedWon24Hours) > this.cacheDurationWonLast24Hours) {
      this.wonLast24Hours = await this.db.bets.computeWonLast24Hours();
      this.lastComputedWon24Hours = Date.now();
    }

    return this.wonLast24Hours;
  }

  async sendStatsUpdate () {
    notificationEmitter.emit(types.STATS_UPDATE, {
      siteStats: this.siteStats,
      totalBets: this.totalBets,
      wonLast24Hours: await this.getWonLast24Hours()
    });
  }

  handle (event) {
    if (this[event.type]) {
      this[event.type](event.payload);
    }
  }

  // events

  diceBet (payload) {
    const currencyStat = this.siteStats.find(s => s.currency === payload.currency);
    this.totalBets++;

    if (!currencyStat) {
      const stat = {
        currency: payload.currency,
        wagered: payload.bet_amount,
        profit: new BigNumber(payload.profit)
          .times(-1)
          .toString(),
        numBets: 1
      };

      this.siteStats.push(stat);
    } else {
      currencyStat.wagered = new BigNumber(currencyStat.wagered)
        .add(payload.bet_amount)
        .toString();
      currencyStat.profit = new BigNumber(currencyStat.profit)
        .minus(payload.profit)
        .toString();
      currencyStat.numBets++;
    }

    this.sendStatsUpdate();
  }
}

module.exports = StatsCache;
