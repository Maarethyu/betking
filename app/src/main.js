import Vue from 'vue';
import VueMq from 'vue-mq';
import {sync} from 'vuex-router-sync';

import App from './App';
import store from './store';
import router from './router';

/* eslint-disable no-new */
new Vue({
  store,
  el: '#app',
  router,
  render: h => h(App)
});

Vue.use(VueMq, {
  breakpoints: {
    mobile: 992,
    desktop: Infinity
  }
});

sync(store, router);
