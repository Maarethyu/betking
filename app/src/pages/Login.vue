<template>
  <div>
    <h1>Login</h1>

    <div class="error">{{errors.global}}</div>

    <form v-on:submit.prevent="onLogin">
      <label for="username">Username</label>
      <input id="username" placeholder="username" name="username">
      <div class="error">{{errors.username}}</div>

      <label for="password">Password</label>
      <input id="password" type="password" placeholder="Password" name="password">
      <div class="error">{{errors.password}}</div>

      <label for="rememberme">Remember me</label>
      <input id="rememberme" type="checkbox" name="rememberme">
      <div class="error">{{errors.rememberme}}</div>

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import api from 'src/api';

export default {
  name: 'Login',
  data: () => ({
    isPageReady: false,
    errors: {}
  }),
  methods: {
    onLogin (e) {
      const data = {
        username: e.target.elements.username.value,
        password: e.target.elements.password.value,
        rememberme: e.target.elements.rememberme.checked
      };

      api.login(data)
        .then(res => {
          this.$store.dispatch('onLogin', res.data);
        })
        .catch(error => {
          this.showErrors(error.response);
        });
    },
    showErrors (response) {          
      if (response && (response.status === 409 || response.status === 401)) {
        this.errors = {
          global: response.data.error
        };
        return;
      }

      this.errors = {
        global: 'An unexpected error occured'
      };
    }
  }
};
</script>