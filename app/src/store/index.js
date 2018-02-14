import Vue from 'vue';
import Vuex from 'vuex';
import account from './modules/account';
import funds from './modules/funds';
import modals from './modules/modals';
import dice from './modules/dice';
import socket from './modules/socket';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    account,
    funds,
    modals,
    dice,
    socket
  }
});
