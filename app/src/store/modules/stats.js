import BigNumber from 'bignumber.js';
import * as types from '../mutation-types';
import api from 'src/api';

const state = {
  totalBets: 0,
  siteStats: [],
  exchangeRates: [],
  sumWonLast24Hours: 0
};

// getters
const getters = {
  totalBets: state => state.totalBets,
  siteStats: state => state.siteStats,
  exchangeRates: state => state.exchangeRates,
  sumWonLast24Hours: state => state.sumWonLast24Hours
};

// actions
const actions = {
  fetchBetStats ({commit, rootState}) {
    api.fetchBetStats()
      .then(res => {
        commit(types.SET_BET_STATS, res.data.totalBets);
        commit(types.SET_EXCHANGE_RATES, res.data.exchangeRates);
        commit(types.SET_WON_LAST_24HOURS, {
          wonLast24Hours: res.data.wonLast24Hours,
          currencies: rootState.funds.currencies
        });
      });
  },

  fetchStats ({commit}) {
    api.fetchSiteStats()
      .then(res => {
        commit(types.SET_SITE_STATS, res.data.stats);
      });
  },

  fetchExchangeRates ({commit}) {
    api.fetchExchangeRates()
      .then(res => {
        commit(types.SET_EXCHANGE_RATES, res.data.exchangeRates);
      });
  }
};

// mutations
const mutations = {
  [types.SET_BET_STATS] (state, totalBets) {
    state.totalBets = totalBets;
  },

  [types.SET_SITE_STATS] (state, stats) {
    state.siteStats = stats;
  },

  [types.SET_EXCHANGE_RATES] (state, exchangeRates) {
    state.exchangeRates = exchangeRates;
  },

  [types.SET_WON_LAST_24HOURS] (state, {wonLast24Hours, currencies}) {
    let sumWonLast24Hours = 0;

    state.exchangeRates.forEach(rate => {
      wonLast24Hours.forEach(stat => {
        const currencyConfig = currencies.find(c => c.id === stat.currency);

        if (stat.currency === rate.currency && currencyConfig) {
          sumWonLast24Hours = new BigNumber(sumWonLast24Hours)
            .add(new BigNumber(stat.won_last_24_hours)
              .dividedBy(new BigNumber(10).pow(currencyConfig.scale))
              .times(rate.last_price));
        }
      });
    });

    state.sumWonLast24Hours = sumWonLast24Hours.toFixed(4);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
