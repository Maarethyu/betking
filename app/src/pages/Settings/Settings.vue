<template>
  <b-container class="settings">
    <h3>Profile</h3>
    <Profile />

    <br />
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
