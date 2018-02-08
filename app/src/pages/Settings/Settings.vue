<template>
  <b-container class="settings">
    <h3>Profile</h3>
    <Profile />
  </b-container>
</template>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import Profile from './Profile';

  export default {
    name: 'Settings',
    components: {
      'b-container': bContainer,
      Profile
    }
  };
</script>
