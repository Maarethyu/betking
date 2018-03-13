import store from 'src/store';

export const beforeEach = async (to, from, next) => {
  if (to.name === 'poker') {
    window.location = '/poker';
  }

  if (!store.state.funds.isReady) {
    try {
      await store.dispatch('fetchCurrencies');
    } catch (e) {
      next(e);
    }
  }

  if (to.matched.some(record => record.meta.requiresUser)) {
    if (!store.state.account.isReady) {
      try {
        await store.dispatch('fetchUser');
      } catch (e) {
        next(e);
      }
    }

    if (to.matched.some(record => record.meta.requiresLoggedOut)) {
      if (store.getters.isLoggedOut) {
        next();
      } else {
        next('/');
      }

      return;
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (store.getters.isAuthenticated) {
        next();
      } else {
        next('/');
      }

      return;
    }

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
