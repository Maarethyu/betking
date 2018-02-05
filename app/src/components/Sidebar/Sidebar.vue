<template>
  <div class="sidebar">
    <nav class="sidebar-nav">
      <div slot="header"></div>
      <ul class="nav">
        <div class="navbar-close navbar-toggler mobile-sidebar-toggler d-lg-none" @click="toggleMobileSideBar"><i class='fa fa-times'></i></div>
        <div class="navbar-close navbar-toggler sidebar-toggler d-md-down-none" @click="toggleSideBar"><i class='fa fa-times'></i></div>
        <div class='navbar-logo-container'>
          <router-link to='/' class='logo'></router-link>
        </div>
        <template v-for="(item, index) in navItems">
          <template v-if="item.title">
            <SidebarNavTitle :name="item.name" :classes="item.class" :wrapper="item.wrapper"/>
          </template>
          <template v-else-if="item.divider">
            <li class="divider"></li>
          </template>
          <template v-else>
            <template v-if="item.children">
              <!-- First level dropdown -->
              <SidebarNavDropdown :name="item.name" :url="item.url" :icon="item.icon">
                <template v-for="(childL1, index) in item.children">
                  <template v-if="childL1.children">
                    <!-- Second level dropdown -->
                    <SidebarNavDropdown :name="childL1.name" :url="childL1.url" :icon="childL1.icon">
                      <li class="nav-item" v-for="(childL2, index) in childL1.children">
                        <SidebarNavLink :name="childL2.name" :url="childL2.url" :icon="childL2.icon" :badge="childL2.badge" :variant="item.variant" :isComingSoon="childL2.isComingSoon"/>
                      </li>
                    </SidebarNavDropdown>
                  </template>
                  <template v-else>
                    <SidebarNavItem :classes="item.class">
                      <SidebarNavLink :name="childL1.name" :url="childL1.url" :icon="childL1.icon" :badge="childL1.badge" :variant="item.variant" :isComingSoon="childL1.isComingSoon"/>
                    </SidebarNavItem>
                  </template>
                </template>
              </SidebarNavDropdown>
            </template>
            <template v-else>
              <SidebarNavItem :classes="item.class">
                <SidebarNavLink :name="item.name" :url="item.url" :icon="item.icon" :badge="item.badge" :variant="item.variant" :isComingSoon="item.isComingSoon"/>
              </SidebarNavItem>
            </template>
          </template>
        </template>
      </ul>
      <slot></slot>
    </nav>
    <!-- <SidebarFooter/> -->
  </div>
</template>
<script>
import SidebarNavDropdown from './SidebarNavDropdown';
import SidebarNavLink from './SidebarNavLink';
import SidebarNavTitle from './SidebarNavTitle';
import SidebarNavItem from './SidebarNavItem';
export default {
  name: 'sidebar',
  props: {
    navItems: {
      type: Array,
      required: true,
      default: () => []
    },
    toggleSideBar: {
      type: Function,
      required: true
    },
    toggleMobileSideBar: {
      type: Function,
      required: true
    }
  },
  components: {
    SidebarNavDropdown,
    SidebarNavLink,
    SidebarNavTitle,
    SidebarNavItem
  }
};
</script>

<style lang="css">
  .nav-link {
    cursor:pointer;
  }
</style>
