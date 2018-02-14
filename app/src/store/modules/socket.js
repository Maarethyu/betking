import * as types from '../mutation-types';
import socketIo from 'socket.io-client';

const state = {
  webSocket: null,
  isSocketConnected: false,
  reconnectionCount: 0
};

// getters
const getters = {
  webSocket: state => state.webSocket,
  isSocketConnected: state => state.isSocketConnected,
  reconnectionCount: state => state.reconnectionCount
};

// actions
const actions = {
  setupSocket ({commit, state}) {
    if (!state.webSocket) {
      const socket = socketIo('/');

      socket.on('connect', () => {
        commit(types.SET_SOCKET_CONNECTION, true);
      });

      socket.on('connect_error', () => {
        socket.disconnect();
        commit(types.SET_SOCKET_CONNECTION, false);
        commit(types.SET_SOCKET_RECONNECTION_COUNT, state.reconnectionCount + 1);
      });

      socket.on('disconnect', () => {
        socket.disconnect();
        commit(types.SET_SOCKET_CONNECTION, false);
        commit(types.SET_SOCKET_RECONNECTION_COUNT, state.reconnectionCount + 1);
      });

      commit(types.SET_WEBSOCKET, socket);
    }
  },

  restartSocket ({commit, state}) {
    if (state.webSocket) {
      state.webSocket.disconnect();
      state.webSocket.connect();
    }
  },

  setSocketReconnectionCount ({commit}, count) {
    commit(types.SET_SOCKET_RECONNECTION_COUNT, count);
  }
};

// mutations
const mutations = {
  [types.SET_WEBSOCKET] (state, socket) {
    state.webSocket = socket;
  },

  [types.SET_SOCKET_CONNECTION] (state, isSocketConnected) {
    state.isSocketConnected = isSocketConnected;
  },

  [types.SET_SOCKET_RECONNECTION_COUNT] (state, reconnectionCount) {
    state.reconnectionCount = reconnectionCount;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
