<template>
  <div class="user-profile">
    <b-row>
      <b-col cols="3">Username:</b-col>
      <b-col cols="9">
        <span class="input-like-div">{{profile.username}}</span>
      </b-col>
    </b-row>

    <b-row align-v="center">
      <b-col cols="3">Password:</b-col>
      <b-col cols="9">
        <span class="input-like-div">********</span>
        <b-button size="sm" class="btn-gray accounts-btn" v-b-modal.changePasswordModal>CHANGE</b-button>
      </b-col>
    </b-row>

    <b-row align-v="center">
      <b-col cols="3">Email:</b-col>
      <b-col cols="9">
        <span class="input-like-div">{{profile.email}}</span>
        <b-button size="sm" class="btn-gray accounts-btn" v-b-modal.changeEmailModal>CHANGE</b-button>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="3">Date Joined:</b-col>
      <b-col cols="9">
        <span class="input-like-div">{{formatDate(profile.dateJoined)}}</span>
      </b-col>
    </b-row>

    <ChangeEmailModal @email-changed="fetchMe"></ChangeEmailModal>
    <ChangePasswordModal @password-changed="fetchMe"></ChangePasswordModal>
	</div>
</template>

<style lang="scss">
  .user-profile {
    border-bottom: solid 1px gray;
    padding-bottom: 25px;
    .row {
      margin-top: 15px;
    }
    .input-like-div {
      -moz-appearance: textfield;
      -webkit-appearance: textfield;
      background-color: white;
      background-color: -moz-field;
      border: 1px solid darkgray;
      box-shadow: 1px 1px 1px 0 lightgray inset;
      font: -moz-field;
      font: -webkit-small-control;
      padding: 2px 3px;
      width: 200px;
      height: 20px;
      margin-right: 15px;
    }
  }
</style>


<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bBadge from 'bootstrap-vue/es/components/badge/badge';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import vBModal from 'bootstrap-vue/es/directives/modal/modal';
  import toastr from 'toastr';

  import {mapGetters} from 'vuex';
  import moment from 'moment';

  import ChangeEmailModal from './ChangeEmailModal';
  import ChangePasswordModal from './ChangePasswordModal';

  import api from 'src/api';

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
      },
      sendVerificationLink () {
        api.sendVerificationLink()
          .then(() => {
            toastr.success('Verification email successfully sent');
          });
      }
    }
  };
</script>
