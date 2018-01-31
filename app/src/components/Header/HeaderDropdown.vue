<template>
  <b-nav-item-dropdown right>
    <template slot="button-content">
      <Avatar username="nverdhan" :size="30" :backgroundColor="'#d53939'"
        :color="'#fff'" :customStyle="{display: 'inline-block', position: 'relative', top: -3}"></Avatar>
      <span class="d-md-down-none">nverdhan</span>
    </template>
    <b-dropdown-header tag="div" class="text-center"><strong>Profile</strong></b-dropdown-header>
    <b-dropdown-item :to="'settings'"><i class="fa fa-wrench"></i>Settings</b-dropdown-item>
    <b-dropdown-item :to="'wallet'"><i class="fa fa-wrench"></i> Wallet</b-dropdown-item>
    <b-dropdown-item :to="'sessions'"><i class="fa fa-laptop"></i>Sessions</b-dropdown-item>
    <b-dropdown-header tag="div" class="text-center"><strong>Security</strong></b-dropdown-header>
    <b-dropdown-item :to="'two-factor'"><i class="fa fa-shield"></i>Two factor Auth</b-dropdown-item>
    <b-dropdown-item :to="'whitelisted-ips'"><i class="fa fa-comments"></i>Whitelisted IPs</b-dropdown-item>
    <b-dropdown-item :to="'login-attempts'"><i class="fa fa-user"></i> Login Attempts</b-dropdown-item>
    <b-dropdown-divider></b-dropdown-divider>
    <b-dropdown-item @click="logout"><i class="fa fa-lock"></i> Logout</b-dropdown-item>
  </b-nav-item-dropdown>
</template>
<style lang="scss">
  .dropdown-toggle::after {
    margin-left: 0.5em;
    border-top: 0.5em solid;
    border-right: 0.5em solid transparent;
    border-left: 0.5em solid transparent;
    vertical-align: 0;
  }
</style>
<script>
  import bNavItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
  import bDropdownHeader from 'bootstrap-vue/es/components/dropdown/dropdown-header';
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
  import bDropdownDivider from 'bootstrap-vue/es/components/dropdown/dropdown-divider';
  import bBadge from 'bootstrap-vue/es/components/badge/badge';

  import Avatar from 'vue-avatar';

  export default {
    name: 'header-dropdown',
    data: () => {
      return {itemsCount: 42};
    },
    components: {
      Avatar,
      'b-nav-item-dropdown': bNavItemDropdown,
      'b-dropdown-header': bDropdownHeader,
      'b-dropdown-item': bDropdownItem,
      'b-dropdown-divider': bDropdownDivider,
      'b-badge': bBadge
    },
    methods: {
      logout () {
        this.$store.dispatch('logout');
      }
    }
  };
</script>
