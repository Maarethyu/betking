import * as types from '../mutation-types';

const state = {
  withdrawalModalCurrency: null,
  isWithdrawalModalVisible: false
};

// getters
const getters = {
  withdrawalModalCurrency: state => state.withdrawalModalCurrency,
  isWithdrawalModalVisible: state => state.isWithdrawalModalVisible
};

// actions
const actions = {
  showWithdrawalModal ({commit}, value) {
    commit(types.SHOW_WITHDRWAL_MODAL, value);
  },

  hideWithdrawalModal ({commit}) {
    commit(types.HIDE_WITHDRAWAL_MODAL);
  }
};

// mutations
const mutations = {
  [types.SHOW_WITHDRWAL_MODAL] (state, value) {
    state.withdrawalModalCurrency = value;
    state.isWithdrawalModalVisible = true;
  },

  [types.HIDE_WITHDRAWAL_MODAL] (state, value) {
    state.withdrawalModalCurrency = null;
    state.isWithdrawalModalVisible = false;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
