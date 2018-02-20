const CurrencyCache = require('./CurrencyCache');
const StatsCache = require('./StatsCache');
const BetsCache = require('./BetsCache');
const ExchangeRateCache = require('./ExchangeRateCache');

class Cache {
  constructor (db) {
    this.currencyCache = new CurrencyCache(db);
    this.statsCache = new StatsCache(db);
    this.betsCache = new BetsCache(db);
    this.exchangeRateCache = new ExchangeRateCache();

    this.cacheItems = [
      this.currencyCache,
      this.statsCache,
      this.betsCache,
      this.exchangeRateCache
    ];
  }

  async load () {
    for (const cache of this.cacheItems) {
      await cache.load();
    }
  }

  handle (event) {
    this.cacheItems.forEach(cache => {
      if (typeof cache.handle === 'function') {
        cache.handle(event);
      }
    });
  }
}

module.exports = Cache;
