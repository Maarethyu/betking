<template>
  <b-nav-item-dropdown left class='text-left currency-dropdown'>
    <template slot="button-content">
      <span class="d-none d-sm-inline-block d-md-inline-block d-lg-none d-xl-inline-block currency-dropdown__balance">
        BALANCE: {{addCommas(formatAmount(activeCurrencyBalance, activeCurrency))}}
      </span>
      <span><CurrencyIcon :value="activeCurrency" :width="13" /></span>
    </template>
    <b-dropdown-item v-for="currency in currencies" :key="currency.symbol"
      @click="setActiveCurrency(currency.value)" balance="currency.balance">
        <CurrencyIcon :value="currency.value" />{{currency.name}}
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<style lang="scss">
.currency-dropdown {
  border: 1px solid rgba(255,255,255,0.3);
  height: calc(1.5em + 8px);
  padding: 4px 8px;
  padding-top: 3px;
  display: flex;

  &__balance {
    font-size: 0.75rem;
  }

  .nav-link {
    height: 1.5em;
    padding: 4px 8px;
    padding: 0;
  }
  .dropdown-toggle::before{
    content: '';
    position: absolute;
    right: 28px;
    top: 0px;
    border-left: 1px solid rgba(255,255,255,0.3);
    height: calc(1.5em + 6px);
  }
  .dropdown-toggle::after{
    content: '';
    position: relative;
    top: 0.2em;
    margin-left: 1em;
    border-width: 0.6em 0.4em 0 0.4em;
    border-color: inherit transparent transparent transparent;
    display: inline-block!important;
  }
}
</style>


<script>
  import bNavItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';

  import {mapGetters} from 'vuex';
  import {addCommas, formatAmount} from 'src/helpers';
  import CurrencyIcon from 'components/CurrencyIcon';

  export default {
    name: 'currency-dropdown',
    components: {
      'b-nav-item-dropdown': bNavItemDropdown,
      'b-dropdown-item': bDropdownItem,
      CurrencyIcon
    },
    computed: {
      ...mapGetters({
        currencies: 'currencies',
        activeCurrency: 'activeCurrency',
        activeCurrencyBalance: 'activeCurrencyBalance'
      })
    },
    mounted () {
      this.fetchBalances();
    },
    methods: {
      addCommas,
      formatAmount,
      setActiveCurrency (value) {
        this.$store.dispatch('setActiveCurrency', value);
      },
      fetchBalances () {
        this.$store.dispatch('fetchAllBalances');
      }
    }
  };
</script>
