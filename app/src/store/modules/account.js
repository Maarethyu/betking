import Fingerprint2 from 'fingerprintjs2';
import {routeUserOnLogin, routeUserOnLogout} from 'src/router/route-helpers';
import api from 'src/api';

import * as types from '../mutation-types';

const state = {
  isReady: false, // Has user been fetched?
  isAuthenticated: false,
  id: null,
  username: '',
  email: null,
  isEmailVerified: null,
  dateJoined: null,
  is2faEnabled: null,
  fingerprint: null,
  confirmWithdrawals: null,
  statsHidden: null,
  bettingDisabled: null,
  ignoredUsers: [],
  showHighrollerBets: null
};

// getters
const getters = {
  isLoggedOut: state => state.isReady && !state.isAuthenticated,
  isAuthenticated: state => state.isReady && state.isAuthenticated,
  profile: state => ({
    id: state.id,
    username: state.username,
    email: state.email,
    isEmailVerified: state.isEmailVerified,
    dateJoined: state.dateJoined,
    confirmWithdrawals: state.confirmWithdrawals,
    statsHidden: state.statsHidden,
    bettingDisabled: state.bettingDisabled
  }),
  username: state => state.username,
  userId: state => state.id,
  showHighrollerBets: state => state.showHighrollerBets,
  ignoredUsers: state => state.ignoredUsers,
  is2faEnabled: state => state.is2faEnabled,
  fingerprint: state => state.fingerprint
};

// actions
const actions = {
  fetchUser ({commit}) {
    return api.fetchUser()
      .then(response => {
        commit(types.UPDATE_AUTHSTATE, true);
        commit(types.SET_USER, response.data);
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          commit(types.UPDATE_AUTHSTATE, false);
        } else {
          throw error;
        }
      });
  },

  onLogin ({commit}, user) {
    commit(types.UPDATE_AUTHSTATE, true);
    commit(types.SET_USER, user);
    routeUserOnLogin();
  },

  logout ({commit, dispatch}) {
    return api.logout()
      .then(() => {
        dispatch('resetStores');
        routeUserOnLogout();
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          // User is already logged out
          dispatch('resetStores');
          routeUserOnLogout();
        } else {
          throw error;
        }
      });
  },

  resetStores ({commit}) {
    commit(types.UPDATE_AUTHSTATE, false);
    commit(types.RESET_DICE_STORE);
    commit(types.RESET_FUNDS_STORE);
    commit(types.RESET_MODALS_STORE);
    // commit(types.RESET_SOCKET_STORE);
  },

  logoutAll ({commit, dispatch}) {
    return api.logoutAll()
      .then(() => {
        dispatch('resetStores');
        routeUserOnLogout();
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          dispatch('resetStores');
          routeUserOnLogout();
        } else {
          throw error;
        }
      });
  },

  setFingerprint ({commit}) {
    new Fingerprint2().get(fingerprint => { commit(types.SET_FINGERPRINT, fingerprint); });
  }
};

// mutations
const mutations = {
  [types.UPDATE_AUTHSTATE] (state, authState) {
    state.isReady = true;
    state.isAuthenticated = authState;

    if (!authState) {
      state.id = null;
      state.username = '';
      state.email = null;
      state.isEmailVerified = null;
      state.dateJoined = null;
      state.is2faEnabled = null;
      state.confirmWithdrawals = null;
      state.statsHidden = null;
      state.bettingDisabled = null;
      state.ignoredUsers = [];
      state.showHighrollerBets = null;
    }
  },

  [types.SET_USER] (state, user) {
    state.id = user.id;
    state.username = user.username;
    state.email = user.email;
    state.dateJoined = user.dateJoined;
    state.isEmailVerified = user.isEmailVerified;
    state.is2faEnabled = user.is2faEnabled;
    state.confirmWithdrawals = user.confirmWithdrawals;
    state.statsHidden = user.statsHidden;
    state.bettingDisabled = user.bettingDisabled;
    state.ignoredUsers = user.ignoredUsers || [];
    state.showHighrollerBets = user.showHighrollerBets;
  },

  [types.SET_FINGERPRINT] (state, fingerprint) {
    state.fingerprint = fingerprint;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
