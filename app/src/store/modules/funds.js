import Vue from 'vue';
import * as types from '../mutation-types';
import api from 'src/api';
import BigNumber from 'bignumber.js';

const state = {
  isReady: false, // Has currencies been fetched?
  currencies: [], // currency config from backend
  activeCurrency: null
};

// getters
const getters = {
  currencies: state => state.currencies,
  balances: state => state.balances
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
  }
};

// mutations
const mutations = {
  [types.SET_CURRENCIES] (state, currencies) {
    state.currencies = currencies.map(c => ({
      ...c,
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
          .toNumber()
      );
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
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
