<template>
  <header class="app-header navbar">
    <button style='position:relative;left:-6px' class="navbar-toggler mobile-sidebar-toggler d-lg-none" type="button" @click="mobileSidebarToggle">
      <span class="navbar-toggler-icon"></span>
    </button>
    <b-link class="navbar-brand" to="/"></b-link>
    <button class="navbar-toggler sidebar-toggler d-md-down-none" type="button" @click="sidebarToggle">
      <span class="navbar-toggler-icon"></span>
    </button>
    <b-nav is-nav-bar class="ml-left logged-in">
      <div class='d-none d-lg-inline-block'>
        <CurrencyDropdown/>
      </div>
    </b-nav>
    <div class="cashierButtons">
      <b-button style='margin-right:3px;' class='logged-in btn-90 btn-padded-small d-none d-md-none d-lg-inline-block' variant="gray">DEPOSIT</b-button>
      <b-button @click="$root.$emit('showModal', 'withdraw')" class='btn-90 btn-padded-small logged-in d-none d-md-none d-lg-inline-block' variant="gray">WITHDRAW</b-button>
    </div>
    <b-nav is-nav-bar class="ml-auto logged-in">
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
    </b-nav>
    <!-- <b-nav is-nav-bar class="ml-auto logged-out">
      <b-button class='d-none d-sm-none d-md-inline-block' @click="$root.$emit('showModal', 'register')" variant="danger">Register</b-button>
      <b-button style='margin-left:5px;' class='d-none d-sm-none d-md-inline-block' @click="$root.$emit('showModal', 'login')" variant="gray">Log In</b-button>
      <LanguageDropdown/>
    </b-nav> -->
  </header>
</template>

<script>
import bLink from 'bootstrap-vue/es/components/link/link';
import bNav from 'bootstrap-vue/es/components/nav/nav';
import bButton from 'bootstrap-vue/es/components/button/button';
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
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
    'b-badge': bBadge
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
