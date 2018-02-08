import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';
import * as hooks from './router-hooks';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    return {x: 0, y: 0};
  },
  routes
});

router.beforeEach(hooks.beforeEach);
router.onError(hooks.onError);

export default router;
