const CurrencyCache = require('./CurrencyCache');
const StatsCache = require('./StatsCache');

class Cache {
  constructor (db) {
    this.currencyCache = new CurrencyCache(db);
    this.statsCache = new StatsCache(db);

    this.cacheItems = [this.currencyCache, this.statsCache];
  }

  async load () {
    for (const cache of this.cacheItems) {
      await cache.load();
    }
  }
}

module.exports = Cache;
