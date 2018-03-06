<template>
  <b-container class="settings account-pages">
    <h3>PROFILE</h3>
    <Profile />
    <BetSettings />
  </b-container>
</template>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import Profile from './Profile';
  import BetSettings from './BetSettings';

  export default {
    name: 'Settings',
    components: {
      'b-container': bContainer,
      Profile,
      BetSettings
    }
  };
</script>
<style lang="scss">
  .account-pages {
    h3 {
      margin-top: 25px;
    }
  }
</style>
