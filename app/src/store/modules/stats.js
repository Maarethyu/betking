import * as types from '../mutation-types';
import api from 'src/api';

const state = {
  totalBets: 0,
  siteStats: []
};

// getters
const getters = {
  totalBets: state => state.totalBets,
  siteStats: state => state.siteStats
};

// actions
const actions = {
  fetchBetStats ({commit}) {
    api.fetchBetStats()
      .then(res => {
        commit(types.SET_BET_STATS, res.data);
      });
  },

  fetchStats ({commit}) {
    api.fetchSiteStats()
      .then(res => {
        commit(types.SET_SITE_STATS, res.data.stats);
      });
  }
};

// mutations
const mutations = {
  [types.SET_BET_STATS] (state, {totalBets}) {
    state.totalBets = totalBets;
  },

  [types.SET_SITE_STATS] (state, stats) {
    state.siteStats = stats;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
