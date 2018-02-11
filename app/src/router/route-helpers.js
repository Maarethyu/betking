import router from 'src/router';

export const routeUserOnLogin = function () {
  const currentRoute = router.currentRoute;

  if (currentRoute.matched.some(record => record.meta.requiresUser) &&
    currentRoute.matched.some(record => record.meta.requiresLoggedOut)) {
    router.replace('/');
  }
};

export const routeUserOnLogout = function () {
  const currentRoute = router.currentRoute;

  if (currentRoute.matched.some(record => record.meta.requiresUser) &&
    currentRoute.matched.some(record => record.meta.requiresAuth)) {
    router.replace('/');
  }
};
