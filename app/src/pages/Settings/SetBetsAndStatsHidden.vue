<template>
  <b-row>
    <b-col cols="10" md="4">
      <span v-if="profile.statsHidden">Your bets and stats are hidden from other users</span>
      <span v-else>Your bets and stats are visible to other users</span>
    </b-col>
    <b-col cols="2">
      <b-button variant="danger" size="sm"
        v-if="profile.statsHidden"
        @click="toggleStatsHidden(false)">
        Hide
      </b-button>
      <b-button variant="success" size="sm"
        v-if="!profile.statsHidden"
        @click="toggleStatsHidden(true)">
        Show
      </b-button>
    </b-col>
  </b-row>
</template>

<script>
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import {mapGetters} from 'vuex';
  import api from 'src/api';
  import {getSecondFactorAuth} from 'src/helpers';

  export default {
    name: 'SetBetsAndStatsHidden',
    components: {
      'b-button': bButton,
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      errors: {}
    }),
    computed: mapGetters({
      profile: 'profile'
    }),
    methods: {
      getSecondFactorAuth,
      async toggleStatsHidden (option) {
        api.toggleStatsHidden(option)
          .then(() => {
            this.$store.dispatch('fetchUser');
          });
      }
    }
  };
</script>
