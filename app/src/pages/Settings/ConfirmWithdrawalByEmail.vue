<template>
  <div>
    <div v-if="errors.confirmWd" class="alert alert-danger">{{ errors.confirmWd }}</div>
    <p>
      Should withdrawals require confirmation via email?
      <b-button variant="danger" size="sm"
        v-if="profile.confirmWithdrawals"
        @click="toggleEmailWithdrawalConfirmation(false)">
        Disable
      </b-button>
      <b-button variant="success" size="sm"
        v-if="!profile.confirmWithdrawals"
        @click="toggleEmailWithdrawalConfirmation(true)">
        Enable
      </b-button>
    </p>
  </div>
</template>

<script>
  import bButton from 'bootstrap-vue/es/components/button/button';

  import {mapGetters} from 'vuex';
  import api from 'src/api';

  export default {
    name: 'ConfirmWithdrawalByEmail',
    components: {
      'b-button': bButton
    },
    data: () => ({
      errors: {}
    }),
    computed: mapGetters({
      profile: 'profile',
      is2faEnabled: 'is2faEnabled'
    }),
    methods: {
      toggleEmailWithdrawalConfirmation (option) {
        let otp = null;
        if (!option && this.is2faEnabled) {
          // TODO: Write a proper vue component for modal
          otp = prompt('Enter 2fa otp');
        }

        api.toggleEmailWithdrawalConfirmation(option, otp)
          .then(() => {
            this.$store.dispatch('fetchUser');
            this.errors = {};
          })
          .catch(e => {
            if (!e.response || !e.response.data || !e.response.data.error) {
              throw e;
            }

            if (e.response.data.error === 'VALID_USER_NOT_FOUND') {
              this.errors = {
                confirmWd: 'You must add an email id to profile and verify it'
              };

              return;
            }

            this.errors = {
              confirmWd: e.response.data.error
            };
          });
      }
    }
  };
</script>
