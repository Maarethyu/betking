import Vue from 'vue';
import Vuex from 'vuex';
import account from './modules/account';
import funds from './modules/funds';
import modals from './modules/modals';
import dice from './modules/dice';
import stats from './modules/stats';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    account,
    funds,
    modals,
    dice,
    stats
  },
  strict: debug
});
