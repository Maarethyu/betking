<template>
  <div class="app header-fixed sidebar-fixed aside-menu-fixed" v-bind:class="{'sidebar-hidden': isSideBarHidden, 'aside-menu-hidden': isChatHidden, 'sidebar-mobile-show': isMobileSidebarShown}">
    <Sidebar :navItems="navItems" :toggleSideBar="toggleSideBar" :toggleMobileSideBar="toggleMobileSideBar" />
    <Header :toggleSideBar="toggleSideBar" :toggleMobileSideBar="toggleMobileSideBar"></Header>
    <div class="app-body">
      <div class='menu-background'></div>
      <main class="main">
        <MobileSecondaryHeader />
        <infoBar :toggleChatBar="toggleChatBar"></infoBar>
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>
    <Footer></Footer>
  </div>
</template>

<style type="scss">
  .error {
    color: red;
  }
  .success {
    color: green;
  }
</style>

<script>
import Header from '../Header/Header';
import MobileSecondaryHeader from '../Header/MobileSecondaryHeader';
import InfoBar from '../Header/InfoBar';

import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer';

import nav from './nav';

export default {
  name: 'AppShell',
  data: () => ({
    navItems: nav.items,
    isSideBarHidden: true,
    isChatHidden: true,
    isMobileSidebarShown: false
  }),
  components: {
    Header,
    MobileSecondaryHeader,
    InfoBar,
    Sidebar,
    Footer
  },
  methods: {
    toggleSideBar () {
      this.isSideBarHidden = !this.isSideBarHidden;
    },
    toggleMobileSideBar () {
      this.isMobileSidebarShown = !this.isMobileSidebarShown;
    },
    toggleChatBar () {
      this.isChatHidden = !this.isChatHidden;
    }
  }
};
</script>
