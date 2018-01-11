import Vue from 'vue';
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

sync(store, router);
