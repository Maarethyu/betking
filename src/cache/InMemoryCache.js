const CurrencyCache = require('./CurrencyCache');
const StatsCache = require('./StatsCache');
const BetsCache = require('./BetsCache');
const ExchangeRateCache = require('./ExchangeRateCache');
const RecommendedBitcoinTxnFeeCache = require('./RecommendedBitcoinTxnFeeCache');

class Cache {
  constructor (db) {
    this.db = db;
    this.currencyCache = new CurrencyCache(db);
    this.statsCache = new StatsCache(db);
    this.betsCache = new BetsCache(db);
    this.exchangeRateCache = new ExchangeRateCache();
    this.recommendedBitcoinTxnFeeCache = new RecommendedBitcoinTxnFeeCache();

    this.cacheItems = [
      this.currencyCache,
      this.statsCache,
      this.betsCache,
      this.exchangeRateCache,
      this.recommendedBitcoinTxnFeeCache
    ];
  }

  async load () {
    for (const cache of this.cacheItems) {
      try {
        await cache.load();
      } catch (e) {
        this.errorHandler(e);
      }
    }
  }

  handle (event) {
    this.cacheItems.forEach(cache => {
      if (typeof cache.handle === 'function') {
        cache.handle(event)
          .catch(error => this.errorHandler(error));
      }
    });
  }

  async errorHandler (error) {
    const query = error.query ? error.query.toString() : null;
    const code = error.code || null;
    const source = error.DB_ERROR ? 'DB_ERROR' : 'CACHE_ERROR';

    await this.db.logs.logError(error.message, error.stack, null, null, source, query, code);

    console.log(source, error);
  }
}

module.exports = Cache;
