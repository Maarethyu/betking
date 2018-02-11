class CurrencyCache {
  constructor () {
    this._currencies = [];
  }

  async loadFromDb () {
    this._currencies = await require('./db').getAllCurrencies();
  }

  get currencies () {
    return this._currencies;
  }

  findById (id) {
    const currency = this._currencies.find(c => c.id === id);
    return currency;
  }

  findBySymbol (symbol) {
    const currency = this._currencies.find(c => c.symbol === symbol);
    return currency;
  }

  getFieldById (id, field) {
    const currency = this._currencies.find(c => c.id === id);

    if (!currency) {
      return null;
    }

    return currency[field];
  }
}

const currencyCache = new CurrencyCache();

module.exports = currencyCache;
