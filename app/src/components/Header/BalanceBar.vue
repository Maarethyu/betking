<template>
  <div class="balanceBar">
    <b-nav is-nav-bar class="ml-left logged-in">
      <div style='display:inline-block;position:relative;top:2px;font-size:13px;'>
        <CurrencyDropdown/>
      </div>
    </b-nav>
    <div class='ml-auto'>
        <div class='d-block d-sm-none'>
            <b-button class='logged-in btn-85 btn-padded-small btn-no-right' variant="gray">DEPOSIT</b-button>
            <b-button @click="$root.$emit('showModal', 'withdraw')" class='btn-85 btn-padded-small logged-in btn-no-left' variant="gray">WITHDRAW</b-button>
            <b-button @click="$root.$emit('showModal', 'register')" class='btn-85 btn-padded-small logged-out btn-no-right' variant="danger">REGISTER</b-button>
            <b-button @click="$root.$emit('showModal', 'login')" class='logged-out btn-85 btn-padded-small btn-no-left' variant="gray">LOG IN</b-button>
        </div>
        <div class='d-none d-sm-block'>
            <b-button class='logged-in btn-110' style='margin-right:10px;' variant="gray">DEPOSIT</b-button>
            <b-button @click="$root.$emit('showModal', 'withdraw')" class='btn-110 logged-in' variant="gray">WITHDRAW</b-button>
            <b-button @click="$root.$emit('showModal', 'register')" class='btn-110 logged-out' style='margin-right:10px;' variant="danger">REGISTER</b-button>
            <b-button @click="$root.$emit('showModal', 'login')" class='logged-out btn-110' variant="gray">LOG IN</b-button>
        </div>
    </div>
  </div>
</template>

<script>
import bNav from 'bootstrap-vue/es/components/nav/nav';
import bButton from 'bootstrap-vue/es/components/button/button';

import CurrencyDropdown from './CurrencyDropdown.vue';

export default {
  name: 'balanceBar',
  components: {
    CurrencyDropdown,
    'b-nav': bNav,
    'b-button': bButton
  }
};
</script>
