import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';
import * as hooks from './router-hooks';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes
});

router.beforeEach(hooks.beforeEach);
router.onError(hooks.onError);

export default router;
