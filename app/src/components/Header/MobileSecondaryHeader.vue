<template>
  <div class="mobile-secondry-header">
    <b-navbar-nav class="ml-left mobile-secondry-header__dropdown" v-if="isAuthenticated">
      <CurrencyDropdown/>
    </b-navbar-nav>
    <div class='ml-auto'>
        <div class='d-block d-sm-none'>
            <b-button class='btn-85 btn-padded-small btn-no-right' variant="gray" v-if="isAuthenticated">DEPOSIT</b-button>
            <b-button class='btn-85 btn-padded-small btn-no-left' variant="gray" v-if="isAuthenticated">WITHDRAW</b-button>
            <b-button class='btn-85 btn-padded-small btn-no-right' variant="danger" v-if="isLoggedOut">REGISTER</b-button>
            <b-button class='btn-85 btn-padded-small btn-no-left' variant="gray" v-if="isLoggedOut">LOG IN</b-button>
        </div>
        <div class='d-none d-sm-block'>
            <b-button class='btn-110 mobile-secondry-header__mrm' variant="gray" v-if="isAuthenticated">DEPOSIT</b-button>
            <b-button class='btn-110 mobile-secondry-header__mrm' variant="gray" v-if="isAuthenticated">WITHDRAW</b-button>
            <b-button class='btn-110 mobile-secondry-header__mrm' variant="danger" v-if="isLoggedOut">REGISTER</b-button>
            <b-button class='btn-110' variant="gray" v-if="isLoggedOut">LOG IN</b-button>
        </div>
    </div>
  </div>
</template>
<style lang="scss">
  .mobile-secondry-header {
    &__dropdown {
      display: inline-block;
      position: relative;
      top: 2px;
      font-size: 13px;
    }
    &__mrm {
      margin-right: 10px;
    }
  }
</style>

<script>
import {mapGetters} from 'vuex';

import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import bButton from 'bootstrap-vue/es/components/button/button';

import CurrencyDropdown from './CurrencyDropdown.vue';

export default {
  name: 'mobileSecondaryHeader',
  components: {
    CurrencyDropdown,
    'b-navbar-nav': bNavbarNav,
    'b-button': bButton
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'isAuthenticated',
      isLoggedOut: 'isLoggedOut'
    }),
  }
};
</script>
