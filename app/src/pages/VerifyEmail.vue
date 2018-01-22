<template>
  <div>
    <h1>Email Verification</h1>

    <div class="success" v-if="message">
      {{ message }}
      <router-link :to="'/'">Go to Dashboard</router-link>
    </div>

    <div class="error">{{ error }}</div>
  </div>
</template>

<script>
import api from 'src/api';
import {getUrlParams} from 'src/helpers';

export default {
  name: 'VerifyEmail',
  data: () => ({
    token: '',
    message: '',
    error: ''
  }),
  mounted () {
    this.token = getUrlParams().token;
    this.verifyEmail();
  },
  methods: {
    verifyEmail () {
      api.verifyEmail({token: this.token})
      .then(res => {
        this.message = res.data.message;
      })
      .catch(err => {
        this.error = err.response.data.error;
      });
    }
  }
};
</script>
