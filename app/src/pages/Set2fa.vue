<template>
  <div>
    <h1>Two factor authentication</h1>

    <div class="error">{{ error }}</div>

    <template v-if="is2faEnabled">
      Two factor authentication is enabled
      <br>
      <h3>Disable Two factor auth</h3>
      <form v-on:submit.prevent="disableTwoFactorAuth">
        <label for="disable-2fa-code">Code from Google authenticator</label>
        <input type="text" placeholder="Code" v-model="otp">
        <br>
        <button type="submit">Disable</button>
      </form>
    </template>

    <template v-else>
      Two factor authentication is NOT enabled
      <br>
      <img :src="newQr">
      <div>Secret: {{ newKey }}</div>
      <br>
      <form v-on:submit.prevent="enableTwoFactorAuth">
        <label for="disable-2fa-code">Code from Google authenticator</label>
        <input type="text" placeholder="Code" v-model="otp">
        <br>
        <button type="submit">Enable</button>
      </form>
    </template>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import api from 'src/api';

export default {
  name: 'Set2fa',
  data: () => ({
    newKey: '',
    newQr: '',
    error: '',
    otp: ''
  }),
  computed: mapGetters({
    is2faEnabled: 'is2faEnabled',
  }),
  mounted () {
    if (!this.is2faEnabled) {
      this.fetchNewKey();
    }
  },
  watch: {
    is2faEnabled (newValue) {
      if (!newValue) {
        this.fetchNewKey();
      }
    }
  },
  methods: {
    fetchUser () {
      this.$store.dispatch('fetchUser');
    },
    fetchNewKey () {
      api.fetchNew2faKey()
        .then(res => {
          this.newKey = res.data.key;
          this.newQr = res.data.qr;
          this.message = '';
          this.error = '';
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            this.error = error.response.data.error;
          } else {
            throw error;
          }
        });
    },
    enableTwoFactorAuth () {
      api.enable2fa(this.otp)
        .then(() => {
          this.fetchUser();
          this.error = '';
          this.otp = '';
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            this.error = error.response.data.error;
          } else {
            throw error;
          }
        });
    },
    disableTwoFactorAuth () {
      api.disable2fa(this.otp)
        .then(() => {
          this.fetchUser();
          this.error = '';
          this.otp = '';
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            this.error = error.response.data.error;
          } else {
            throw error;
          }
        });
    }
  }
};
</script>
