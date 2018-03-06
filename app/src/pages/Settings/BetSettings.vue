<template>
  <div>
    <div class="bet-settings">
      <h3>Make your bets and stats private</h3>
      <b-row>
        <b-col cols="10" md="4">
          <span v-if="profile.statsHidden">Your bets and stats are hidden from other users</span>
          <span v-else>Your bets and stats are visible to other users</span>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="2">
          <b-button variant="danger" size="sm" class="accounts-btn mt-15"
            v-if="profile.statsHidden"
            @click="toggleStatsHidden(false)">
            HIDE
          </b-button>
          <b-button variant="success" class="accounts-btn mt-15"
            v-if="!profile.statsHidden"
            @click="toggleStatsHidden(true)">
            SHOW
          </b-button>
        </b-col>
      </b-row>
    </div>
    <div class="bet-settings">
      <h3>Show/Hide highroller bets in chat</h3>
      <b-row>
        <b-col cols="10" md="4">
          <span v-if="showHighrollerBets">Highroller bets are shown in chats</span>
          <span v-else>Highroller bets are hidden from chat</span>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="2">
          <b-button variant="danger" class="accounts-btn mt-15"
            v-if="showHighrollerBets"
            @click="toggleDisplayHighrollersInChat(false)">
            HIDE
          </b-button>
          <b-button variant="success" class="accounts-btn mt-15"
            v-if="!showHighrollerBets"
            @click="toggleDisplayHighrollersInChat(true)">
            SHOW
          </b-button>
        </b-col>
      </b-row>
    </div>
    <div class="bet-settings no-border">
      <h3>Disable Betting</h3>
      <b-row>
        <b-col cols="10">
          <span v-if="profile.bettingDisabled">Betting disabled on account</span>
          <span v-else>You can disable betting on account. Warning, this cannot be reversed.</span>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="2">
          <b-button variant="danger" class="accounts-btn mt-15"
            v-if="!profile.bettingDisabled"
            @click="disableBetting">
            DISABLE
          </b-button>
        </b-col>
      </b-row>
    </div>
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
      profile: 'profile',
      showHighrollerBets: 'showHighrollerBets'
    }),
    methods: {
      getSecondFactorAuth,
      async toggleStatsHidden (option) {
        api.toggleStatsHidden(option)
          .then(() => {
            this.$store.dispatch('fetchUser');
          });
      },
      toggleDisplayHighrollersInChat (option) {
        api.toggleDisplayHighrollersInChat(option)
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

<style lang="scss" scoped>
  .bet-settings {
    border-bottom: solid 1px gray;
    padding-bottom: 25px;
    &.no-border {
      border-bottom: none;
    }
  }
</style>

