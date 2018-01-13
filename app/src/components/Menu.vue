<template>
  <nav>
    <router-link :to="'/'">Index</router-link>

    <template v-if="isLoggedOut">
      <router-link :to="'login'">Login</router-link>
      <router-link :to="'forgot-password'">Forgot Password</router-link>
      <router-link :to="'register'">Register</router-link>
    </template>

    <template v-if="isAuthenticated">
      <router-link :to="'settings'">Settings</router-link>
      <router-link :to="'sessions'">Sessions</router-link>
      <router-link :to="'two-factor'">2fa</router-link>
      <a href="javascript:void(0)" @click="logout">Logout</a>
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
  }),
  methods: {
    logout () {
      this.$store.dispatch('logout');
    }
  }
};
</script>
