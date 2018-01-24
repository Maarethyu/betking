import Vue from 'vue';
import Vuex from 'vuex';
import account from './modules/account';
import funds from './modules/funds';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    /* User authentication */
    account,
    /* Monetory stuff */
    funds
  },
  strict: debug
});
