import store from 'src/store';

export const beforeEach = async (to, from, next) => {
  /* Check if config fetched from server */
  if (!store.state.funds.isReady) {
    try {
      await store.dispatch('fetchCurrencies');
    } catch (e) {
      next(e);
    }
  }

  /* Check if route requiresUser, requiresAuth or requiresLoggedOut */

  if (to.matched.some(record => record.meta.requiresUser)) {
    /* If store does not have user, fetch it first */
    if (!store.state.account.isReady) {
      try {
        await store.dispatch('fetchUser');
      } catch (e) {
        next(e);
      }
    }

    /* Routes that require user to be logged out */
    if (to.matched.some(record => record.meta.requiresLoggedOut)) {
      if (store.getters.isLoggedOut) {
        next();
      } else {
        next('/');
      }

      return;
    }

    /* Routes that require user to be authenticated */
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (store.getters.isAuthenticated) {
        next();
      } else {
        next('/');
      }

      return;
    }

    /* Routes that render for both user logged in and logged out */
    next();

    return;
  }

  next();
};

export const onError = (error) => {
  if (error.response) {
    console.error(error.response);
  }

  console.error(error);
};
