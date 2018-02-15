<template>
  <b-container>
    <b-row :align-h="$mq === 'desktop' ? 'end' : 'start'" class="filter-all-bets">
      <b-col cols="2" md="1">
        <b-button v-if="watchBetsPaused" variant="default" @click="setPaused(false)"><i class="fa fa-play" /></b-button>
        <b-button v-else variant="default" @click="setPaused(true)"><i class="fa fa-pause" /></b-button>
      </b-col>

      <b-col cols="6" offset="4" md="3" offset-md="0">
        <CurrencySelector :defaultName="'All currencies'" @change="updateCurrency" :showAllCurrenciesOption="true"></CurrencySelector>
      </b-col>

      <b-col cols="6" md="3">
        <b-form-input id="username-filter" v-model="usernameFilter" type="text" placeholder="Username Filter"></b-form-input>
      </b-col>

      <b-col cols="6" md="3">
        <b-form-input id="betamount-filter" v-model="betAmountFilter" type="number" placeholder="Min Bet Amount Filter"></b-form-input>
      </b-col>
    </b-row>

    <b-nav tabs>
      <b-nav-item v-for="navItem of navItems" :key="navItem.name"
        :active="navItem.name === activeNavItem" @click="activeNavItem = navItem.name">
        {{ navItem.displayName }}
      </b-nav-item>

      <BetList v-if="activeNavItem === 'AllBets'" :bets="allBetsFiltered" :showUsername="true"></BetList>
      <BetList v-if="activeNavItem === 'HighrollerBets'" :bets="highrollerBetsFiltered" :showUsername="true"></BetList>
    </b-nav>
  </b-container>
</template>

<style lang="scss">
  input#betamount-filter {
    &::-webkit-outer-spin-button, &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
  .filter-all-bets {
    padding-top: 20px;

    .dropdown {
      width: 100%;
      .dropdown-toggle {
        width: 100%;
      }
    }

    .col-6 {
      text-align: center;
      margin-bottom: 5px;
    }
  }
</style>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bNav from 'bootstrap-vue/es/components/nav/nav';
  import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import CurrencySelector from 'components/CurrencySelector';
  import BetList from 'components/BetList';

  import {mapGetters} from 'vuex';
  import {formatBigAmount} from 'src/helpers';

  const navItems = [{
    name: 'AllBets',
    displayName: 'All Bets'
  }, {
    name: 'HighrollerBets',
    displayName: 'Highroller'
  }];

  export default {
    name: 'AllBets',
    components: {
      'b-container': bContainer,
      'b-row': bRow,
      'b-col': bCol,
      'b-button': bButton,
      'b-nav': bNav,
      'b-nav-item': bNavItem,
      'b-form-group': bFormGroup,
      'b-form-input': bFormInput,
      CurrencySelector,
      BetList
    },
    data: () => ({
      navItems,
      activeNavItem: 'AllBets',
      usernameFilter: '',
      betAmountFilter: '',
      filterByCurrency: -1
    }),
    computed: {
      ...mapGetters({
        allBets: 'allBets',
        highrollerBets: 'highrollerBets',
        isAuthenticated: 'isAuthenticated',
        currencies: 'currencies',
        watchBetsPaused: 'watchBetsPaused'
      }),
      allBetsFiltered () {
        return this.filterBets(this.allBets);
      },
      highrollerBetsFiltered () {
        return this.filterBets(this.highrollerBets);
      }
    },
    watch: {
      isAuthenticated () {
        this.stopWatchingBets();
        this.startWatchingBets();
      }
    },
    mounted () {
      this.startWatchingBets();
    },
    destroyed () {
      this.stopWatchingBets();
    },
    methods: {
      formatBigAmount,
      startWatchingBets () {
        this.$store.dispatch('watchBets');
      },
      stopWatchingBets () {
        this.$store.dispatch('stopWatchingBets');
      },
      updateCurrency (currency) {
        this.filterByCurrency = currency;
      },
      setPaused (shouldPause) {
        this.$store.dispatch('toggleWatchBetsPaused', shouldPause);
      },
      filterBets (betsList) {
        return betsList.filter(bet => {
          let filteredByUsername = true;
          let filteredByBetAmount = true;
          let filteredByCurrency = true;

          if (this.usernameFilter) {
            filteredByUsername = bet.username.toLowerCase().indexOf(this.usernameFilter) > -1;
          }

          if (!isNaN(parseFloat(this.betAmountFilter))) {
            const betAmount = this.formatBigAmount(bet.bet_amount, bet.currency);
            filteredByBetAmount = betAmount > this.betAmountFilter;
          }

          if (this.filterByCurrency !== -1) {
            filteredByCurrency = this.filterByCurrency === bet.currency;
          }

          return filteredByUsername && filteredByBetAmount && filteredByCurrency;
        });
      }
    }
  };
</script>
