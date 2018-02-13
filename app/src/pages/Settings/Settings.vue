<template>
  <b-container class="settings">
    <h3>Profile</h3>
    <Profile />

    <br />
    <h3>Make your bets and stats private</h3>
    <SetBetsAndStatsHidden />
  </b-container>
</template>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import Profile from './Profile';
  import SetBetsAndStatsHidden from './SetBetsAndStatsHidden';

  export default {
    name: 'Settings',
    components: {
      'b-container': bContainer,
      Profile,
      SetBetsAndStatsHidden
    }
  };
</script>
