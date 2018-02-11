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
  confirmWithdrawals: null
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
    confirmWithdrawals: state.confirmWithdrawals
  }),
  username: state => state.username,
  userId: state => state.id,
  is2faEnabled: state => state.is2faEnabled,
  fingerprint: statte => state.fingerprint
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

  logout ({commit}) {
    return api.logout()
      .then(() => {
        commit(types.UPDATE_AUTHSTATE, false);
        routeUserOnLogout();
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          // User is already logged out
          commit(types.UPDATE_AUTHSTATE, false);
          routeUserOnLogout();
        } else {
          throw error;
        }
      });
  },

  clearAuthState ({commit}) {
    commit(types.UPDATE_AUTHSTATE, false);
  },

  logoutAll ({commit}) {
    return api.logoutAll()
      .then(() => {
        commit(types.UPDATE_AUTHSTATE, false);
        routeUserOnLogout();
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          commit(types.UPDATE_AUTHSTATE, false);
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
