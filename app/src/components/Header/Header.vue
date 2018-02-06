<template>
  <header class="bk-header app-header navbar">

    <button class="navbar-toggler bk-header__sidebar-toggle--mobile d-lg-none"
      @click="toggleMobileSideBar">
      <span class="navbar-toggler-icon"></span>
    </button>

    <b-link class="navbar-brand" to="/"></b-link>

    <button class="navbar-toggler bk-header__sidebar-toggle d-md-down-none" @click="toggleSideBar">
      <span class="navbar-toggler-icon"></span>
    </button>

    <b-navbar-nav class="ml-left d-none d-lg-inline-block" v-if="isAuthenticated">
      <CurrencyDropdown/>
    </b-navbar-nav>

    <div class="cashierButtons" v-if="isAuthenticated">
      <b-button @click="showDepositModal" style='margin-right:3px;' class='btn-90 btn-padded-small d-none d-md-none d-lg-inline-block' variant="gray">DEPOSIT</b-button>
      <b-button @click="showWithdrawalModal" class='btn-90 btn-padded-small d-none d-md-none d-lg-inline-block' variant="gray">WITHDRAW</b-button>
    </div>

    <b-navbar-nav class="ml-auto" v-if="isAuthenticated">
      <HeaderDropdown/>
      <div class='d-none d-lg-inline-block'>
      </div>
    </b-navbar-nav>

    <b-navbar-nav class="ml-auto" v-if="isLoggedOut">
      <b-button class='d-none d-sm-none d-lg-inline-block' v-b-modal.registerModal variant="danger">Register</b-button>
      <b-button style='margin-left:5px;' class='d-none d-sm-none d-lg-inline-block' v-b-modal.loginModal variant="gray">Log In</b-button>
    </b-navbar-nav>
  </header>
</template>

<style lang="scss">
  .app-header.bk-header {
    color: #fff;
    padding-right: 15px;

    .navbar-brand {
      bottom: 10px;
    }

    &__sidebar-toggle {
      &--mobile {
        position: relative;
        left: -6px;
      }
    }

    .dropdown-item {
      img {
          margin-right:6px;
      }
    }

    .cashierButtons{
      margin-left: 10px;
    }
  }
</style>


<script>
import {mapGetters} from 'vuex';

import bLink from 'bootstrap-vue/es/components/link/link';
import bNav from 'bootstrap-vue/es/components/nav/nav';
import bButton from 'bootstrap-vue/es/components/button/button';
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import bBadge from 'bootstrap-vue/es/components/badge/badge';
import vBModal from 'bootstrap-vue/es/directives/modal/modal';

import HeaderDropdown from './HeaderDropdown.vue';
import CurrencyDropdown from './CurrencyDropdown.vue';

export default {
  name: 'Header',
  props: ['toggleSideBar', 'toggleMobileSideBar'],
  components: {
    CurrencyDropdown,
    // LanguageDropdown,
    HeaderDropdown,
    'b-link': bLink,
    'b-nav': bNav,
    'b-button': bButton,
    'b-nav-item': bNavItem,
    'b-badge': bBadge,
    'b-navbar-nav': bNavbarNav
  },
  directives: {
    'b-modal': vBModal
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'isAuthenticated',
      isLoggedOut: 'isLoggedOut',
      activeCurrency: 'activeCurrency'
    }),
  },
  methods: {
    showWithdrawalModal () {
      this.$store.dispatch('showWithdrawalModal', this.activeCurrency);
    },
    showDepositModal () {
      this.$store.dispatch('showDepositModal', this.activeCurrency);
    }
  }
};
</script>
