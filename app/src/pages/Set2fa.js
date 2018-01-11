<template>
  <div>

  </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'Set2fa',
  computed: {
    ...mapGetters({
      profile: 'profile',
    }),
    isTwoFactorEnabled () {

    }
  }
};
</script>
