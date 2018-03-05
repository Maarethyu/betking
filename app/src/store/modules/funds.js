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

  setActiveCurrency ({commit}, id) {
    commit(types.SET_ACTIVE_CURRENCY, id);
  }
};

// mutations
const mutations = {
  [types.SET_CURRENCIES] (state, currencies) {
    state.currencies = currencies.map(c => Object.assign({}, c, {
      // value: c.id,
      maxWithdrawalLimit: new BigNumber(c.max_withdraw_limit)
        .div(new BigNumber(10).pow(c.scale))
        .toNumber(),
      minWithdrawalLimit: new BigNumber(c.min_withdraw_limit)
        .div(new BigNumber(10).pow(c.scale))
        .toNumber(),
      withdrawalFee: new BigNumber(c.withdrawal_fee)
        .div(new BigNumber(10).pow(c.scale))
        .toNumber(),
      minTip: new BigNumber(c.min_tip)
        .div(new BigNumber(10).pow(c.scale))
        .toNumber(),
      balance: 0
    }));
    state.isReady = true;
  },

  [types.SET_ALL_BALANCES] (state, balances) {
    balances.forEach(row => {
      const currencyIdx = state.currencies.findIndex(c => c.id === row.currency);

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

      if (row.currency === state.activeCurrency) {
        state.activeCurrencyBalance = new BigNumber(row.balance)
          .div(new BigNumber(10).pow(scale))
          .toString();
      }
    });
  },

  [types.SET_BALANCE] (state, {currency, balance}) {
    const currencyIdx = state.currencies.findIndex(c => c.id === currency);

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

  [types.SET_ACTIVE_CURRENCY] (state, id) {
    state.activeCurrency = id;

    const currency = state.currencies.find(c => c.id === id);

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
