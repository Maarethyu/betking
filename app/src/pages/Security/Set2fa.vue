<template>
  <b-container>
    <div></div>
    <b-row>
      <b-col>
        <h5>Two factor authentication</h5>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
      </b-col>
    </b-row>
    <template v-if="is2faEnabled">
      <b-row>
        <b-col cols="8">
          <h5>Disable Two factor auth</h5>
          <b-form v-on:submit.prevent="disableTwoFactorAuth">
            <b-form-group label="Code from Google authenticator" label-for="code">
              <b-form-input id="code" placeholder="Code" name="otp" v-model="otp" :state="!error && otp" />
              <b-button variant="danger" type="submit">Disable</b-button>
            </b-form-group>
          </b-form>
        </b-col>
      </b-row>
    </template>

    <template v-else>
      <b-row>
        <b-col class="col-sm-12" md="8">
          <b-row>
            <b-col cols="12">
              <div>Code from Google authenticator</div>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="9">
              <b-form v-on:submit.prevent="enableTwoFactorAuth">
                <b-form-group>
                  <b-form-input id="code" placeholder="Code" name="otp" v-model="otp" :state="!error && otp" />
                </b-form-group>
              </b-form>
            </b-col>
            <b-col cols="3">
              <b-button class="float-right" variant="success" type="submit">Enable</b-button>
            </b-col>
          </b-row>
          <CopyToClipboard v-bind:text="newKey"></CopyToClipboard>
        </b-col>
        <b-col cols="12" md="4">
          <div class="text-center">
            <img :src="newQr" width="200">
          </div>
        </b-col>
      </b-row>
    </template>
    <hr>
  </b-container>
</template>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bForm from 'bootstrap-vue/es/components/form/form';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import CopyToClipboard from 'components/CopyToClipboard';
  import {mapGetters} from 'vuex';
  import toastr from 'toastr';
  import api from 'src/api';

  export default {
    name: 'Set2fa',
    components: {
      'b-container': bContainer,
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
            toastr.success('Two factor authentication enabled');
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
            toastr.success('Two factor authentication disabled');
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

