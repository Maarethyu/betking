const request = require('request');
const config = require('config');

const exchangeCurrencyToBk = {
  btcusd: 0, // bitfinex
  ethusd: 1, // bitfinex
  // dash: 2,
  // ltcusd: 3, // bitfinex
  // monero: 4,
  // omisego: 5,
  // tron: 8,
  // eos: 9,
  // status: 11,
  // populous: 12,
  // 'golem-network-tokens': 13,
  // augur: 15,
  // veritaseum: 16,
  // salt: 17,
  // 'basic-attention-token': 18,
  // funfair: 19,
  // 'power-ledger': 21,
  // tenx: 24,
  // '0x': 25,
  // civic: 28
};

class ExchangeRateCache {
  constructor () {
    this.cacheDuration = config.get('CACHE_DURATION_EXCHANGE_RATE_MS');

    this.exchangeRates = [];
    this.lastFetchTime = null;

    this.cmcApi = 'https://api.coinmarketcap.com/v1/ticker/';
    this.bitfinexApi = 'https://api.bitfinex.com/v1/';
    this.currenciesToAlwaysFetch = ['btcusd', 'ethusd'];

    this.rotatingCurrencies = this.initializeRotatingCurrencies();
    this.lastCurrencyInRotationIndex = this.rotatingCurrencies.length - 1;
  }

  async load () {
    const currenciesToFetch = Object.keys(exchangeCurrencyToBk);
    await this.fetchExchangeRates(currenciesToFetch);
  }

  initializeRotatingCurrencies () {
    const rotatingCurrencies = [];

    Object.keys(exchangeCurrencyToBk).forEach(c => {
      if (this.currenciesToAlwaysFetch.indexOf(c) === -1) {
        rotatingCurrencies.push(c);
      }
    });

    return rotatingCurrencies;
  }

  getNextCurrencyInRotation () {
    let nextIndex = this.lastCurrencyInRotationIndex + 1;
    if (nextIndex === this.rotatingCurrencies.length) {
      nextIndex = 0;
    }

    this.lastCurrencyInRotationIndex = nextIndex;
    return this.rotatingCurrencies[nextIndex];
  }

  extractExchangeRateFromCmcResponse (response) {
    let body;
    try {
      body = JSON.parse(response.body);
    } catch (e) {
      return;
    }

    if (!Array.isArray(body) || body.length === 0) {
      return;
    }

    return parseFloat(body[0].price_usd);
  }

  extractExchangeRateFromBitfinexResponse (response) {
    let body;
    try {
      body = JSON.parse(response.body);
    } catch (e) {
      return;
    }

    return parseFloat(body.last_price);
  }

  getUrl (currencyName, shouldFetchFromBitfinex) {
    if (shouldFetchFromBitfinex) {
      return `${this.bitfinexApi}/pubticker/${currencyName}`;
    } else {
      return `${this.cmcApi}/${currencyName}/`;
    }
  }

  fetchExchangeRates (currenciesToFetch) {
    const bitfinexCurrencies = ['btcusd', 'ethusd', 'ltcusd'];

    const promises = currenciesToFetch.map(currencyName => new Promise(resolve => {
      const shouldFetchFromBitfinex = bitfinexCurrencies.indexOf(currencyName) > -1;

      request.get(this.getUrl(currencyName, shouldFetchFromBitfinex), (error, response) => {
        if (error) {
          resolve();
          return;
        }

        const lastPrice = shouldFetchFromBitfinex
          ? this.extractExchangeRateFromBitfinexResponse(response)
          : this.extractExchangeRateFromCmcResponse(response);

        if (!lastPrice) {
          resolve();
          return;
        }

        const cachedCurrency = this.exchangeRates.find(r => r.currency === exchangeCurrencyToBk[currencyName]);

        if (!cachedCurrency) {
          this.exchangeRates.push({currency: exchangeCurrencyToBk[currencyName], lastPrice});
          resolve();
          return;
        }

        cachedCurrency.last_price = lastPrice;
        resolve();
      });
    }));

    return Promise.all(promises)
      .then((res) => {
        this.lastFetchTime = Date.now();
      });
  }

  // public api

  async getExchangeRates () {
    if (this.exchangeRates.length < Object.keys(exchangeCurrencyToBk).length ||
      !this.lastFetchTime ||
      (Date.now() - this.lastFetchTime) > this.cacheDuration) {
      const currenciesToFetch = [...this.currenciesToAlwaysFetch, this.getNextCurrencyInRotation()];

      await this.fetchExchangeRates(currenciesToFetch);
    }

    return this.exchangeRates;
  }
}

module.exports = ExchangeRateCache;
