import * as types from '../mutation-types';

const initialState = () => ({
  withdrawalModalCurrency: null,
  isWithdrawalModalVisible: false,
  depositModalCurrency: null,
  isDepositModalVisible: false
});

// getters
const getters = {
  withdrawalModalCurrency: state => state.withdrawalModalCurrency,
  isWithdrawalModalVisible: state => state.isWithdrawalModalVisible,
  depositModalCurrency: state => state.depositModalCurrency,
  isDepositModalVisible: state => state.isDepositModalVisible
};

// actions
const actions = {
  showWithdrawalModal ({commit}, value) {
    commit(types.SHOW_WITHDRWAL_MODAL, value);
  },

  hideWithdrawalModal ({commit}) {
    commit(types.HIDE_WITHDRAWAL_MODAL);
  },

  showDepositModal ({commit}, value) {
    commit(types.SHOW_DEPOSIT_MODAL, value);
  },

  hideDepositModal ({commit}) {
    commit(types.HIDE_DEPOSIT_MODAL);
  }
};

// mutations
const mutations = {
  [types.SHOW_WITHDRWAL_MODAL] (state, value) {
    state.withdrawalModalCurrency = value;
    state.isWithdrawalModalVisible = true;
  },

  [types.HIDE_WITHDRAWAL_MODAL] (state) {
    state.withdrawalModalCurrency = null;
    state.isWithdrawalModalVisible = false;
  },

  [types.SHOW_DEPOSIT_MODAL] (state, value) {
    state.isDepositModalVisible = true;
    state.depositModalCurrency = value;
  },

  [types.HIDE_DEPOSIT_MODAL] (state) {
    state.isDepositModalVisible = false;
    state.depositModalCurrency = null;
  },

  [types.RESET_MODALS_STORE] (state) {
    const s = initialState();
    Object.keys(s).forEach(key => {
      state[key] = s[key];
    });
  }
};

export default {
  state: initialState(),
  getters,
  actions,
  mutations
};
