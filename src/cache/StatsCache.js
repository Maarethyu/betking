const BigNumber = require('bignumber.js');

class StatsCache {
  constructor (db) {
    this.db = db;

    this.totalBets = 0;
    this.siteStats = [];
  }

  async load () {
    const betStatsByCurrency = await this.db.getBetStatsByCurrency();

    this.totalBets = this.totalBetsFromStats(betStatsByCurrency);
    this.siteStats = this.siteStatsFromStats(betStatsByCurrency);
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

  addBet (bet) {
    const currencyStat = this.siteStats.find(s => s.currency === bet.currency);
    this.totalBets++;

    if (!currencyStat) {
      const stat = {
        currency: bet.currency,
        wagered: bet.bet_amount,
        profit: new BigNumber(bet.profit)
          .times(-1)
          .toString(),
        numBets: 1
      };

      this.siteStats.push(stat);
    } else {
      currencyStat.wagered = new BigNumber(currencyStat.wagered)
        .add(bet.bet_amount)
        .toString();
      currencyStat.profit = new BigNumber(currencyStat.profit)
        .minus(bet.profit)
        .toString();
      currencyStat.numBets++;
    }
  }
}

module.exports = StatsCache;
