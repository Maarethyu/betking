<template>
  <div class='currency-select'>
    <b-nav-item-dropdown left class='text-left'>
      <template slot="button-content">
        <span><div class='d-none d-sm-inline-block d-md-inline-block d-lg-none d-xl-inline-block'>BALANCE:</div> {{balance}}</span>
        <span><img src='/static/img/main/btc.png' width='13' height='13'></span>
      </template>
      <b-dropdown-item @click="currency = '(B)'; balance=$root.state.user.balance.btc"><i class="fa fa-btc"></i> Bitcoin</b-dropdown-item>
      <b-dropdown-item @click="currency = '(L)'; balance=$root.state.user.balance.ltc"><i class="fa fa-btc"></i> Ethereum</b-dropdown-item>
      <b-dropdown-item @click="currency = '(E)'; balance=$root.state.user.balance.eth"><i class="fa fa-btc"></i> Litecoin</b-dropdown-item>
      <b-dropdown-item @click="currency = '(B)'; balance=$root.state.user.balance.bkb"><i class="fa fa-btc"></i> BetKing BKB</b-dropdown-item>
    </b-nav-item-dropdown>
  </div>
</template>

<script>
  import bNavItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';

  export default {
    name: 'currency-dropdown',
    components: {
      'b-nav-item-dropdown': bNavItemDropdown,
      'b-dropdown-item': bDropdownItem
    },
    data: () => {
      return {
        currency: '',
        balance: ''
      };
    }
  };
</script>
