<template>
  <AppShellMinimal>
    <b-row>
      <b-col cols="8" offset="2">
        <h1>Email Verification</h1>

        <div v-if="message" class="alert alert-success">
          {{ message }}
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <router-link :to="'/'">Go to Dashboard</router-link>
      </b-col>
    </b-row>
  </AppShellMinimal>
</template>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import api from 'src/api';
  import {getUrlParams} from 'src/helpers';
  import AppShellMinimal from 'components/AppShell/AppShellMinimal';

  export default {
    name: 'VerifyEmail',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      AppShellMinimal
    },
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
