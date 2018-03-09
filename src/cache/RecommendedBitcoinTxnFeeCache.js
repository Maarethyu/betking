const requestPromise = require('request-promise');
const config = require('config');

class RecommendedBitcoinTxnFeeCache {
  constructor () {
    this.lastFetched = null;
    this.fee = null;
  }

  async load () {
    this.fee = await requestPromise({
      uri: 'https://bitcoinfees.earn.com/api/v1/fees/recommended',
      json: true
    });
    this.lastFetched = Date.now();
  }

  async fetchRecommendedBitcoinTxnFee () {
    const shouldFetch = !this.lastFetched ||
      Date.now() - this.lastFetched > config.get('CACHE_DURATION_RECOMMENDED_TXN_FEE');
    if (shouldFetch) {
      this.fee = await requestPromise({
        uri: 'https://bitcoinfees.earn.com/api/v1/fees/recommended',
        json: true
      });
      this.lastFetched = Date.now();
    }
    return this.fee;
  }
}

module.exports = RecommendedBitcoinTxnFeeCache;
