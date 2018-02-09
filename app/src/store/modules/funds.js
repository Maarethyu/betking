import Vue from 'vue';
import * as types from '../mutation-types';
import api from 'src/api';
import BigNumber from 'bignumber.js';

const state = {
  isReady: false, // Has currencies been fetched?
  currencies: [], // currency config from backend
  activeCurrency: 0,
  activeCurrencyBalance: 0
};

// getters
const getters = {
  currencies: state => state.currencies,
  balances: state => state.balances,
  activeCurrency: state => state.activeCurrency,
  activeCurrencyBalance: state => state.activeCurrencyBalance
};

// actions
const actions = {
  fetchCurrencies ({commit, state}, refresh) {
    if (state.isReady && !refresh) {
      return;
    }

    return api.fetchCurrencies()
      .then(res => {
        commit(types.SET_CURRENCIES, res.data.currencies);
      });
  },

  fetchAllBalances ({commit}) {
    api.fetchAllBalances()
      .then(res => {
        commit(types.SET_ALL_BALANCES, res.data.balances);
      });
  },

  setActiveCurrency ({commit}, value) {
    commit(types.SET_ACTIVE_CURRENCY, value);
  }
};

// mutations
const mutations = {
  [types.SET_CURRENCIES] (state, currencies) {
    state.currencies = currencies.map(c => Object.assign({}, c, {
      maxWdLimit: new BigNumber(c.maxWdLimit)
        .div(new BigNumber(10).pow(c.scale))
        .toNumber(),
      minWdLimit: new BigNumber(c.minWdLimit)
        .div(new BigNumber(10).pow(c.scale))
        .toNumber(),
      wdFee: new BigNumber(c.wdFee)
        .div(new BigNumber(10).pow(c.scale))
        .toNumber(),
      minTip: new BigNumber(c.minTip)
        .div(new BigNumber(10).pow(c.scale))
        .toNumber(),
      balance: 0
    }));
    state.isReady = true;
  },

  [types.SET_ALL_BALANCES] (state, balances) {
    balances.forEach(row => {
      const currencyIdx = state.currencies.findIndex(c => c.value === row.currency);

      if (currencyIdx === -1) {
        console.error(`Currency not found in config: ${row.currency}`);
        return;
      }

      const scale = state.currencies[currencyIdx].scale;

      Vue.set(
        state.currencies[currencyIdx],
        'balance',
        new BigNumber(row.balance)
          .div(new BigNumber(10).pow(scale))
          .toString()
      );

      /* Set balance for active currency */
      if (row.currency === state.activeCurrency) {
        state.activeCurrencyBalance = new BigNumber(row.balance)
          .div(new BigNumber(10).pow(scale))
          .toString();
      }
    });
  },

  [types.SET_BALANCE] (state, {currency, balance}) {
    const currencyIdx = state.currencies.findIndex(c => c.value === currency);

    if (currencyIdx === -1) {
      console.error(`Currency not found in config: ${currency}`);
      return;
    }

    const scale = state.currencies[currencyIdx].scale;

    Vue.set(
      state.currencies[currencyIdx],
      'balance',
      new BigNumber(balance)
        .div(new BigNumber(10).pow(scale))
        .toNumber()
    );

    if (currency === state.activeCurrency) {
      state.activeCurrencyBalance = new BigNumber(balance)
        .div(new BigNumber(10).pow(scale))
        .toNumber();
    }
  },

  [types.SET_ACTIVE_CURRENCY] (state, value) {
    state.activeCurrency = value;

    const currency = state.currencies.find(c => c.value === value);

    if (!currency) {
      console.error(`Active Currency not found in config: ${currency}`);
      return;
    }

    state.activeCurrencyBalance = currency.balance;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
