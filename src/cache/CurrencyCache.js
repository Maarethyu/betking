class CurrencyCache {
  constructor (db) {
    this._db = db;
    this._currencies = [];
  }

  async load () {
    this._currencies = await this._db.getAllCurrencies();
  }

  get currencies () {
    return this._currencies;
  }

  findById (id) {
    let idNumeric = id;
    if (typeof id !== 'number') {
      idNumeric = parseInt(id, 10);
    }

    const currency = this._currencies.find(c => c.id === idNumeric);
    return currency;
  }

  findBySymbol (symbol) {
    const currency = this._currencies.find(c => c.symbol === symbol);
    return currency;
  }

  getFieldById (id, field) {
    let idNumeric = id;
    if (typeof id !== 'number') {
      idNumeric = parseInt(id, 10);
    }

    const currency = this._currencies.find(c => c.id === idNumeric);

    if (!currency) {
      return null;
    }

    return currency[field];
  }
}

module.exports = CurrencyCache;
