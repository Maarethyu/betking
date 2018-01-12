<template>
  <div>
    <h1>Forgot Password</h1>

    <div class="success">{{ message }}</div>

    <form v-on:submit.prevent="forgotPassword">
      <label for="email">Email</label>
      <input id="email" placeholder="email" name="email" v-model="email">
      <div class="error">{{ errors.email }}</div>

      <button type="submit">Forgot Password</button>
    </form>
  </div>
</template>

<script>
import api from 'src/api';

export default {
  name: 'ForgotPassword',
  data: () => ({
    email: '',
    message: '',
    errors: {}
  }),
  methods: {
    forgotPassword () {
      const data = {
        email: this.email
      };

      api.forgotPassword(data)
        .then(res => {
          this.message = res.data.message;
          this.errors = {};
          this.email = '';
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
            this.message = '';
          }
        });
    }
  }
};
</script>
