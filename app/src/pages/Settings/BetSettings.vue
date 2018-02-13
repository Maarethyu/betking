<template>
  <div>
    <h3>Make your bets and stats private</h3>
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

    <br>
    <h3>Disable Betting</h3>
    <b-row>
      <b-col cols="10" md="4">
        <span v-if="profile.bettingDisabled">Betting disabled on account</span>
        <span v-else>You can disable betting on account. Warning, this cannot be reversed.</span>
      </b-col>
      <b-col cols="2">
        <b-button variant="danger" size="sm"
          v-if="!profile.bettingDisabled"
          @click="disableBetting">
          Disable
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import toastr from 'toastr';
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
      },
      disableBetting () {
        api.disableBetting()
          .then(() => {
            this.$store.dispatch('fetchUser');
            toastr.success('Betting disabled on account');
          });
      }
    }
  };
</script>
