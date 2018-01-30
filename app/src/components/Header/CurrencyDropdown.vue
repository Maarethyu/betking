<template>
  <div class='currency-dropdown'>
    <b-nav-item-dropdown left class='text-left'>
      <template slot="button-content">
        <span class="d-none d-sm-inline-block d-md-inline-block d-lg-none d-xl-inline-block currency-dropdown__balance">
          BALANCE: {{balance}}
        </span>
        <span><img src='/static/img/main/btc.png' width='13' height='13'></span>
      </template>
      <b-dropdown-item @click="currency = '(B)'; balance=$root.state.user.balance.btc"><i class="fa fa-btc"></i> Bitcoin</b-dropdown-item>
      <b-dropdown-item @click="currency = '(L)'; balance=$root.state.user.balance.ltc"><i class="fa fa-btc"></i> Ethereum</b-dropdown-item>
      <b-dropdown-item @click="currency = '(E)'; balance=$root.state.user.balance.eth"><i class="fa fa-btc"></i> Litecoin</b-dropdown-item>
      <b-dropdown-item @click="currency = '(B)'; balance=$root.state.user.balance.bkb"><i class="fa fa-btc"></i> BetKing BKB</b-dropdown-item>
    </b-nav-item-dropdown>
  </div>
</template>

<style lang="scss">
.currency-dropdown {
  border:1px solid rgba(255,255,255,0.3);
  height:calc(1.5em + 8px);
  padding:4px 8px;
  padding-top:3px;
  display:flex;

  &__balance {
    font-size: 0.75rem;
  }

  .nav-link{
    height:1.5em;
    padding:4px 8px;
    padding:0;
  }
  .dropdown-toggle::before{
    content:'';
    position:absolute;
    right:18px;
    top:-3px;
    border-left:1px solid rgba(255,255,255,0.3);
    height:calc(1.5em + 6px);
  }
  .dropdown-toggle::after{
    content:'';
    position:relative;
    top:0.2em;
    margin-left:1em;
    border-width:0.6em 0.4em 0 0.4em;
    border-color:inherit transparent transparent transparent;
    display:inline-block!important;
  }
}
</style>


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
        balance: '20.000000010000000000'
      };
    }
  };
</script>
