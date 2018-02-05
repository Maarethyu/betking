<template>
  <b-row>
    <b-col cols="8" offset="2">
      <h3>Two factor authentication</h3>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <template v-if="is2faEnabled">
        <div class="alert alert-success">Two factor authentication is enabled</div>
        <br>
        <h3>Disable Two factor auth</h3>
        <b-form v-on:submit.prevent="disableTwoFactorAuth">
          <b-form-group label="Code from Google authenticator" label-for="code">
            <b-form-input id="code" placeholder="Code" name="otp" v-model="otp" :state="!error && otp" />
          </b-form-group>
          <br>
          <b-button variant="danger" type="submit">Disable</b-button>
        </b-form>
      </template>

      <template v-else>
        <h5>Two factor authentication is NOT enabled</h5>
        <br>
        <div class="text-center">
          <img :src="newQr" width="300">
          <br>
          <br>
          <CopyToClipboard v-bind:text="newKey"></CopyToClipboard>
        </div>
        <br>
        <b-form v-on:submit.prevent="enableTwoFactorAuth">
          <b-form-group label="Code from Google authenticator" label-for="code">
            <b-form-input id="code" placeholder="Code" name="otp" v-model="otp" :state="!error && otp" />
          </b-form-group>
          <b-button variant="success" type="submit">Enable</b-button>
        </b-form>
      </template>
    </b-col>
  </b-row>
</template>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bForm from 'bootstrap-vue/es/components/form/form';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import CopyToClipboard from 'components/CopyToClipboard';
  import {mapGetters} from 'vuex';
  import api from 'src/api';

  export default {
    name: 'Set2fa',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      'b-form': bForm,
      'b-form-group': bFormGroup,
      'b-form-input': bFormInput,
      'b-button': bButton,
      CopyToClipboard
    },
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
