<template>
  <div>
    <h1>Reset Password</h1>

    <div class="success" v-if="message">
      {{ message }}
      <router-link :to="'login'">Go to Login</router-link>
    </div>

    <div class="error">{{ errors.token }}</div>

    <form v-on:submit.prevent="resetPassword">
      <label for="password">Password</label><br>
      <input id="password" placeholder="password" name="password" type="password" v-model="form.password">
      <div class="error">{{ errors.password }}</div>

      <label for="password2">Confirm Password</label><br>
      <input id="password2" placeholder="password2" name="password2" type="password" v-model="form.password2">
      <div class="error">{{ errors.password2 }}</div>

      <button type="submit">Reset Password</button>
    </form>
  </div>
</template>

<script>
import api from 'src/api';
import {getUrlParams} from 'src/helpers';

export default {
  name: 'ResetPassword',
  data: () => ({
    token: '',
    message: '',
    errors: {},
    form: {
      password: '',
      password2: ''
    }
  }),
  mounted () {
    this.token = getUrlParams().token;
  },
  methods: {
    resetPassword () {
      const data = {
        token: this.token,
        password: this.form.password,
        password2: this.form.password2
      };

      api.resetPassword(data)
        .then(res => {
          this.message = res.data.message;
          this.errors = {};
          this.resetForm();
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            const newErrors = {};

            error.response.data.errors.forEach(error => {
              newErrors[error.param] = newErrors[error.param]
                ? `${newErrors[error.param]} / ${error.msg}`
                : error.msg;
            });

            this.errors = newErrors;
          }

          if (error.response && error.response.status === 409) {
            this.errors = {
              token: error.response.data.error
            };
          }

          this.message = '';
        });
    },
    resetForm () {
      this.form.password = '';
      this.form.password2 = '';
    }
  }
};
</script>
