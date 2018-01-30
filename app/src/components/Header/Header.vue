<template>
  <header class="bk-header app-header navbar">

    <button class="navbar-toggler bk-header__sidebar-toggle--mobile d-lg-none"
      @click="mobileSidebarToggle">
      <span class="navbar-toggler-icon"></span>
    </button>

    <b-link class="navbar-brand" to="/"></b-link>

    <button class="navbar-toggler bk-header__sidebar-toggle d-md-down-none" @click="sidebarToggle">
      <span class="navbar-toggler-icon"></span>
    </button>

    <b-navbar-nav class="ml-left logged-in d-none d-lg-inline-block">
      <CurrencyDropdown/>
    </b-navbar-nav>

    <div class="cashierButtons">
      <b-button style='margin-right:3px;' class='logged-in btn-90 btn-padded-small d-none d-md-none d-lg-inline-block' variant="gray">DEPOSIT</b-button>
      <b-button @click="$root.$emit('showModal', 'withdraw')" class='btn-90 btn-padded-small logged-in d-none d-md-none d-lg-inline-block' variant="gray">WITHDRAW</b-button>
    </div>

    <b-navbar-nav class="ml-auto logged-in">
      <b-nav-item class="d-sm-down-none">
        <i class="icon-envelope"></i>
        <b-badge pill variant="danger">5</b-badge>
      </b-nav-item>
      <b-nav-item class="d-sm-down-none">
        <i class="icon-bell"></i>
        <b-badge pill variant="danger">2</b-badge>
      </b-nav-item>
      <HeaderDropdown/>
      <div class='d-none d-lg-inline-block'>
        <!-- <LanguageDropdown/> -->
      </div>
    </b-navbar-nav>
    <!-- <b-navbar-nav class="ml-auto logged-out">
      <b-button class='d-none d-sm-none d-md-inline-block' @click="$root.$emit('showModal', 'register')" variant="danger">Register</b-button>
      <b-button style='margin-left:5px;' class='d-none d-sm-none d-md-inline-block' @click="$root.$emit('showModal', 'login')" variant="gray">Log In</b-button>
      <LanguageDropdown/>
    </b-navbar-nav> -->
  </header>
</template>

<style lang="scss">
  .app-header.bk-header {
    color: #fff;

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
import bLink from 'bootstrap-vue/es/components/link/link';
import bNav from 'bootstrap-vue/es/components/nav/nav';
import bButton from 'bootstrap-vue/es/components/button/button';
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import bBadge from 'bootstrap-vue/es/components/badge/badge';

import HeaderDropdown from './HeaderDropdown.vue';
// import LanguageDropdown from './LanguageDropdown.vue'
import CurrencyDropdown from './CurrencyDropdown.vue';

export default {
  name: 'Header',
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
  methods: {
    sidebarToggle (e) {
      e.preventDefault();
      document.body.classList.toggle('sidebar-hidden');
    },
    sidebarMinimize (e) {
      e.preventDefault();
      document.body.classList.toggle('sidebar-minimized');
    },
    mobileSidebarToggle (e) {
      e.preventDefault();
      document.body.classList.toggle('sidebar-mobile-show');
    }
  }
};
</script>
