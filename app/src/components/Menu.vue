<template>
  <nav>
    <router-link :to="'/'">Index</router-link>
    <router-link :to="'/stats'">Stats</router-link>

    <template v-if="isLoggedOut">
      <router-link :to="'login'">Login</router-link>
      <router-link :to="'register'">Register</router-link>
    </template>

    <template v-if="isAuthenticated">
      <router-link :to="'settings'">Settings</router-link>
      <router-link :to="'sessions'">Sessions</router-link>
      <router-link :to="'two-factor'">2fa</router-link>
      <router-link :to="'logout'">Logout</router-link>
    </template>
  </nav>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'Menu',
  computed: mapGetters({
    isLoggedOut: 'isLoggedOut',
    isAuthenticated: 'isAuthenticated'
  })
};
</script>
