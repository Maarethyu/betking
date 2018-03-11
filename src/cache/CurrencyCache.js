class CurrencyCache {
  constructor (db) {
    this.db = db;
    this.currenciesCache = [];
  }

  async load () {
    this.currenciesCache = await this.db.wallet.getAllCurrencies();
  }

  get currencies () {
    return this.currenciesCache;
  }

  findById (id) {
    let idNumeric = id;
    if (typeof id !== 'number') {
      idNumeric = parseInt(id, 10);
    }

    const currency = this.currenciesCache.find(c => c.id === idNumeric);
    return currency;
  }

  findBySymbol (symbol) {
    const currency = this.currenciesCache.find(c => c.symbol === symbol);
    return currency;
  }

  getFieldById (id, field) {
    let idNumeric = id;
    if (typeof id !== 'number') {
      idNumeric = parseInt(id, 10);
    }

    const currency = this.currenciesCache.find(c => c.id === idNumeric);

    if (!currency) {
      return null;
    }

    return currency[field];
  }

  handle (event) {
    if (this[event.type]) {
      this[event.type](event.payload);
    }
  }
}

module.exports = CurrencyCache;
