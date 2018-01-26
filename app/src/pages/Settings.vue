<template>
  <div>
  	<h1>Settings</h1>

      <table>
        <tbody>
          <tr>
            <td>Id:</td>
            <td>{{profile.id}}</td>
          </tr>
          <tr>
            <td>Username:</td>
            <td>{{profile.username}}</td>
          </tr>
          <tr>
            <td>email:</td>
            <td>{{profile.email}}</td>
          </tr>
          <tr>
            <td>isEmailVerified:</td>
            <td>{{profile.isEmailVerified}}</td>
          </tr>
          <tr>
            <td>dateJoined:</td>
            <td>{{profile.dateJoined}}</td>
          </tr>
          </tr>
        </tbody>
      </table>

      <h2>Change Email</h2>
      <div class="error">{{errors.changeEmailError}}</div>
      <div class="success">{{changeEmailMessage}}</div>

      <form v-on:submit.prevent="changeEmail">
        <label for="email">Email</label>
        <input id="email" placeholder="email" name="email" v-model="newEmail">
        <div class="error">{{errors.email}}</div>

        <button type="submit">Change Email</button>
      </form>

      <h2>Change Password</h2>
      <div class="error">{{errors.changePasswordError}}</div>
      <div class="success">{{changePasswordMessage}}</div>

      <form v-on:submit.prevent="changePassword">
        <label for="existing password">Existing Password</label>
        <input id="existing password" type="password" placeholder="Existing Password" name="existingPassword" v-model="passwordForm.existingPassword">
        <div class="error">{{errors.existingPassword}}</div>

        <label for="password">Password</label>
        <input id="password" type="password" placeholder="Password" name="password" v-model="passwordForm.password">
        <div class="error">{{errors.password}}</div>

        <label for="password2">Confirm Password</label>
        <input id="password2" type="password" placeholder="Confirm Password" name="password2" v-model="passwordForm.password2">
        <div class="error">{{errors.password2}}</div>

        <button type="submit">Change Password</button>
      </form>

      <h2>Withdrawal Whitelist</h2>
      <WithdrawalWhitelist></WithdrawalWhitelist>

	</div>
</template>

<script>
import api from 'src/api';
import {mapGetters} from 'vuex';

import WithdrawalWhitelist from 'components/WithdrawalWhitelist';

export default {
  name: 'Settings',
  components: {
    WithdrawalWhitelist
  },
  data: () => ({
    errors: {},
    newEmail: '',
    passwordForm: {
      existingPassword: '',
      password: '',
      password2: ''
    },
    changeEmailMessage: '',
    changePasswordMessage: ''
  }),
  computed: mapGetters({
    profile: 'profile'
  }),
  methods: {
    fetchMe () {
      this.$store.dispatch('fetchUser');
    },
    changeEmail (e) {
      const data = {
        email: e.target.elements.email.value,
      };

      api.changeEmail(data)
        .then(res => {
          this.resetEmailForm();
          this.fetchMe();
          this.changeEmailMessage = 'Email changed successfully';
        })
        .catch(error => {
          this.changeEmailMessage = '';
          this.showErrors(error.response);
        });
    },
    changePassword (e) {
      const data = {
        existingPassword: e.target.elements.existingPassword.value,
        password: e.target.elements.password.value,
        password2: e.target.elements.password2.value
      };

      api.changePassword(data)
        .then(res => {
          this.resetPasswordForm();
          this.fetchMe();
          this.changePasswordMessage = 'Password changed successfully.';
        })
        .catch(error => {
          this.showErrors(error.response);
        });
    },
    logout () {
      this.$store.dispatch('logout');
    },
    showErrors (response) {
      if (response && response.status === 400) {
        const newErrors = {};

        response.data.errors.forEach(error => {
          newErrors[error.param] = newErrors[error.param]
            ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
        });

        this.errors = newErrors;
        return;
      }

      if (response && response.status === 401) {
        this.errors = {
          changePasswordError: response.data.error,
        };
        return;
      }

      if (response && response.status === 409) {
        this.errors = {
          changeEmailError: response.data.error,
        };
      }
    },
    resetEmailForm () {
      this.newEmail = '';
    },
    resetPasswordForm () {
      this.passwordForm.existingPassword = '';
      this.passwordForm.password = '';
      this.passwordForm.password2 = '';
    }
  }
};
</script>
