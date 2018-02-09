import Vue from 'vue';
import Vuex from 'vuex';
import account from './modules/account';
import funds from './modules/funds';
import modals from './modules/modals';
import dice from './modules/dice';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    /* User authentication */
    account,
    /* Monetory stuff */
    funds,
    /* All modal states */
    modals,
    /* Dice Game */
    dice
  },
  strict: debug
});
