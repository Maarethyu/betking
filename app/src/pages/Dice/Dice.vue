<template>
  <div class="dice animated fadeIn">
    <BetControls />

    <br>

    <b-row class="dice__bottom-panel">
      <b-col cols="12" sm="10" offset-sm="1">
        <b-nav tabs>
          <b-nav-item v-for="navItem of navItems" :key="navItem.name"
            :active="navItem.name === activeNavItem" @click="activeNavItem = navItem.name">
            {{ navItem.displayName }}
          </b-nav-item>
        </b-nav>

        <BetList :showUsername="false" :bets="myBets" v-if="activeNavItem === 'BetResults'" />
        <SessionStats v-if="activeNavItem === 'SessionStats'" />
      </b-col>
    </b-row>
  </div>
</template>

<style lang="scss">
  .dice {
    margin-top: 10px;
    &__bottom-panel {
      min-height: 250px;
    }
  }
</style>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bNav from 'bootstrap-vue/es/components/nav/nav';
  import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';

  import BetControls from './BetControls';
  import BetList from 'components/BetList';
  import SessionStats from './SessionStats';

  import {getRandomAlphanumeric} from 'src/helpers';
  import {mapGetters} from 'vuex';

  const navItems = [{
    name: 'BetResults',
    displayName: 'Bet Results'
  }, {
    name: 'SessionStats',
    displayName: 'Session Stats'
  }];

  export default {
    name: 'Dice',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      'b-nav': bNav,
      'b-nav-item': bNavItem,
      BetControls,
      BetList,
      SessionStats
    },
    data: () => ({
      navItems,
      activeNavItem: 'BetResults'
    }),
    computed: mapGetters({
      isAuthenticated: 'isAuthenticated',
      activeCurrency: 'activeCurrency',
      myBets: 'diceLatestBets'
    }),
    mounted () {
      this.loadDiceState();
    },
    watch: {
      isAuthenticated () {
        this.loadDiceState();
      },
      activeCurrency () {
        this.loadDiceState();
      }
    },
    methods: {
      loadDiceState () {
        if (this.isAuthenticated) {
          const clientSeed = getRandomAlphanumeric(20);
          this.$store.dispatch('loadDiceState', {clientSeed, currency: this.activeCurrency});
        }
      }
    }
  };
</script>
