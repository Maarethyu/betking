<template>
  <b-nav-item-dropdown right class="account-dropdown">
    <template slot="button-content">
      <Avatar :username="username" :size="30" :backgroundColor="'#d53939'"
        :color="'#fff'"
        :customStyle="{display: 'inline-block', position: 'relative', 'margin-right': '5px'}"></Avatar>
      <span class="d-md-down-none">{{ username }}</span>
    </template>
    <b-dropdown-item :to="'settings'"><i class="fa fa-wrench"></i>Settings</b-dropdown-item>
    <b-dropdown-item :to="'wallet'"><i class="fa fa-bitcoin"></i> Wallet</b-dropdown-item>
    <b-dropdown-item :to="'security'"><i class="fa fa-lock"></i> Security</b-dropdown-item>
    <b-dropdown-divider></b-dropdown-divider>
    <b-dropdown-item @click="logout"><i class="fa fa-power-off"></i> Logout</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<style lang="scss">
  .navbar-nav .account-dropdown {
    .dropdown-toggle {
      padding: 0 10px;

      &::after {
        margin-left: 0.5em;
        border-top: 0.5em solid;
        border-right: 0.5em solid transparent;
        border-left: 0.5em solid transparent;
        vertical-align: 0;
      }
    }
    .dropdown-menu {
      padding: 10px!important;
    }
  }
</style>

<script>
  import bNavItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
  import bDropdownHeader from 'bootstrap-vue/es/components/dropdown/dropdown-header';
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
  import bDropdownDivider from 'bootstrap-vue/es/components/dropdown/dropdown-divider';
  import bBadge from 'bootstrap-vue/es/components/badge/badge';

  import Avatar from 'vue-avatar';

  import {mapGetters} from 'vuex';

  export default {
    name: 'header-dropdown',
    data: () => {
      return {itemsCount: 42};
    },
    computed: mapGetters({
      username: 'username'
    }),
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
