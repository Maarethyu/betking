<template>
  <b-container class="settings">
    <h3>Profile</h3>
    <Profile />

    <br>

    <h3>Withdrawal Whitelist</h3>
    <WithdrawalWhitelist></WithdrawalWhitelist>

    <h3>Confirm Withdrawals by Email</h3>
    <ConfirmWithdrawalByEmail></ConfirmWithdrawalByEmail>
  </b-container>
</template>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import Profile from './Profile';
  import WithdrawalWhitelist from './WithdrawalWhitelist';
  import ConfirmWithdrawalByEmail from './ConfirmWithdrawalByEmail';

  export default {
    name: 'Settings',
    components: {
      'b-container': bContainer,
      Profile,
      WithdrawalWhitelist,
      ConfirmWithdrawalByEmail
    }
  };
</script>
