<template>
  <b-nav-item-dropdown left class='text-left currency-dropdown'>
    <template slot="button-content">
      <div class="currency-dropdown__balance-text">
        BALANCE:
      </div>
      <div class="currency-dropdown__balance-amount">
        {{addCommas(formatAmount(activeCurrencyBalance, activeCurrency))}}
      </div>
      <div class="currency-dropdown__balance-icon">
        <CurrencyIcon :value="activeCurrency" :width="13" />
      </div>
    </template>
    <b-dropdown-item v-for="currency in currencies" :key="currency.symbol"
      @click="setActiveCurrency(currency.value)" balance="currency.balance">
        <CurrencyIcon :value="currency.value" />{{currency.name}}
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<style lang="scss">
  $currency-dropdown-width: 204px;
  $currency-dropdown-height: 29px;

  .currency-dropdown {
    border: 1px solid rgba(255,255,255,0.3);
    padding: 0;
    height: $currency-dropdown-height;
    display: flex;

    &__balance-text {
      font-size: 0.75rem;
      font-family: roboto;
      margin-right: 4px;
    }

    &__balance-amount {
      font-size: 0.75rem;
      font-family: roboto;
      margin-right: 4px;
    }

    &__balance-icon {
      margin-right: 4px;
      width: 13px;
      height: 13px;
      display: flex;
    }

    .dropdown-menu {
      width: $currency-dropdown-width;
    }

    .dropdown-item img {
      margin-right: 5px;
    }

    .dropdown-toggle {
      min-width: $currency-dropdown-width;
      position: relative;
      height: $currency-dropdown-height;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: flex-start;
      padding-right: 34px!important;
      padding-left: 10px!important;

      &::before{
        content: '';
        position: absolute;
        right: 28px;
        top: 0px;
        border-left: 1px solid rgba(255,255,255,0.3);
        height: 27px;
      }

      &::after{
        content: '';
        position: absolute;
        top: 11px;
        right: 9px;
        margin-left: 1.1em;
        border-width: 0.6em 0.4em 0 0.4em;
        border-color: inherit transparent transparent transparent;
        display: inline-block!important;
      }
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
