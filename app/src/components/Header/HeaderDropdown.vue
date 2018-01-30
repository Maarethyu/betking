<template>
  <b-nav-item-dropdown right>
    <template slot="button-content">
      <Avatar username="nverdhan" :size="25" :backgroundColor="'#d53939'"
        :color="'#fff'" :customStyle="{display: 'inline-block', position: 'relative', top: -3}"></Avatar>
      <span class="d-md-down-none">nverdhan</span>
    </template>
    <b-dropdown-header tag="div" class="text-center"><strong>NEW</strong></b-dropdown-header>
    <b-dropdown-item><i class="fa fa-wrench"></i>Settings</b-dropdown-item>
    <b-dropdown-item><i class="fa fa-laptop"></i>Sessions</b-dropdown-item>
    <b-dropdown-item><i class="fa fa-shield"></i>Two factor</b-dropdown-item>
    <b-dropdown-item><i class="fa fa-comments"></i>Whitelisted IPs</b-dropdown-item>
    <b-dropdown-header tag="div" class="text-center"><strong>Settings</strong></b-dropdown-header>
    <b-dropdown-item><i class="fa fa-user"></i> Profile</b-dropdown-item>
    <b-dropdown-item><i class="fa fa-wrench"></i> Settings</b-dropdown-item>
    <b-dropdown-item><i class="fa fa-usd"></i> Payments<b-badge variant="danger">{{itemsCount}}</b-badge></b-dropdown-item>
    <b-dropdown-item><i class="fa fa-file"></i> Projects<b-badge variant="danger">{{itemsCount}}</b-badge></b-dropdown-item>
    <b-dropdown-divider></b-dropdown-divider>
    <b-dropdown-item><i class="fa fa-shield"></i> Lock Account</b-dropdown-item>
    <b-dropdown-item @click='$root.$emit("logout")'><i class="fa fa-lock"></i> Logout</b-dropdown-item>
  </b-nav-item-dropdown>
</template>
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
    }
  };
</script>
