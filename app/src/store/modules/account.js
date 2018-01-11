import api from 'src/api';
import router from 'src/router';

import * as types from '../mutation-types';

const state = {
  isReady: false, // Has user been fetched?
  isAuthenticated: false,
  id: null,
  username: '',
  email: null,
  isEmailVerified: null,
  dateJoined: null
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
    dateJoined: state.dateJoined
  }),
  username: state => state.username,
  userId: state => state.id
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
    router.replace('/');
  },

  logout ({commit}) {
    return api.logout()
      .then(() => {
        commit(types.UPDATE_AUTHSTATE, false);
        commit(types.UNSET_USER);

        router.replace('/');
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          // User is already logged out
          commit(types.UPDATE_AUTHSTATE, false);
          commit(types.UNSET_USER);

          router.replace('/');
        } else {
          throw error;
        }
      });
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
    }
  },

  [types.SET_USER] (state, user) {
    state.id = user.id;
    state.username = user.username;
    state.email = user.email;
    state.dateJoined = user.dateJoined;
    state.isEmailVerified = user.isEmailVerified;
  },

  [types.UNSET_USER] (state) {
    state.id = null;
    state.username = '';
    state.email = null;
    state.dateJoined = null;
    state.isEmailVerified = null;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
