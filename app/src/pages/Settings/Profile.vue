<template>
  <div class="user-profile">
    <b-row no-gutters>
      <b-col cols="3">Username:</b-col>
      <b-col cols="9">{{profile.username}}</b-col>
    </b-row>

    <b-row no-gutters align-v="center">
      <b-col cols="3">Password:</b-col>
      <b-col cols="9">
        *********
        <b-button size="sm" variant="default" v-b-modal.changePasswordModal>Change</b-button>
      </b-col>
    </b-row>

    <b-row no-gutters align-v="center">
      <b-col cols="3">Email:</b-col>
      <b-col cols="9">
        {{profile.email}}
        <template v-if="profile.isEmailVerified">
          <b-badge variant="success">Verified</b-badge>
        </template>
        <template v-else>
          <b-badge variant="danger">Not verified</b-badge>
        </template>
        <b-button size="sm" variant="default" v-b-modal.changeEmailModal>Change</b-button>
      </b-col>
    </b-row>

    <b-row no-gutters>
      <b-col cols="3">Date Joined:</b-col>
      <b-col cols="9">{{formatDate(profile.dateJoined)}}</b-col>
    </b-row>

    <ChangeEmailModal @email-changed="fetchMe"></ChangeEmailModal>
    <ChangePasswordModal @password-changed="fetchMe"></ChangePasswordModal>
	</div>
</template>

<style lang="scss">
  .user-profile {
    max-width: 500px;
  }
</style>


<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bBadge from 'bootstrap-vue/es/components/badge/badge';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import vBModal from 'bootstrap-vue/es/directives/modal/modal';

  import {mapGetters} from 'vuex';
  import moment from 'moment';

  import ChangeEmailModal from './ChangeEmailModal';
  import ChangePasswordModal from './ChangePasswordModal';

  export default {
    name: 'Settings',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      'b-container': bContainer,
      'b-badge': bBadge,
      'b-button': bButton,
      ChangeEmailModal,
      ChangePasswordModal
    },
    directives: {
      'b-modal': vBModal
    },
    computed: mapGetters({
      profile: 'profile'
    }),
    methods: {
      formatDate (date) {
        return moment(date).format('LL');
      },
      fetchMe () {
        this.$store.dispatch('fetchUser');
      }
    }
  };
</script>
