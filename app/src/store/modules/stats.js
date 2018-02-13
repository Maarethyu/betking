import * as types from '../mutation-types';
import api from 'src/api';

const state = {
  totalBets: 0
};

// getters
const getters = {
  totalBets: state => state.totalBets
};

// actions
const actions = {
  fetchBetStats ({commit}) {
    api.fetchBetStats()
      .then(res => {
        commit(types.SET_BET_STATS, res.data);
      });
  }
};

// mutations
const mutations = {
  [types.SET_BET_STATS] (state, {totalBets}) {
    state.totalBets = totalBets;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
