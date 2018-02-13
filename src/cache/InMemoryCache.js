const CurrencyCache = require('./CurrencyCache');

class Cache {
  constructor (db) {
    this.currencyCache = new CurrencyCache(db);

    this.cacheItems = [this.currencyCache];
  }

  async load () {
    for (const cache of this.cacheItems) {
      await cache.load();
    }
  }
}

module.exports = Cache;
