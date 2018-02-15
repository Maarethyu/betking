const CurrencyCache = require('./CurrencyCache');
const StatsCache = require('./StatsCache');
const BetsCache = require('./BetsCache');

class Cache {
  constructor (db) {
    this.currencyCache = new CurrencyCache(db);
    this.statsCache = new StatsCache(db);
    this.betsCache = new BetsCache(db);

    this.cacheItems = [this.currencyCache, this.statsCache, this.betsCache];
  }

  async load () {
    for (const cache of this.cacheItems) {
      await cache.load();
    }
  }

  handle (event) {
    this.cacheItems.forEach(cache => {
      cache.handle(event);
    });
  }
}

module.exports = Cache;
