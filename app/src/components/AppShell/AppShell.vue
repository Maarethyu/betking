<template>
  <div class="app header-fixed sidebar-fixed  aside-menu-fixed"
    v-bind:class="{'sidebar-hidden': isSideBarHidden, 'sidebar-mobile-show': isMobileSidebarShown,
    'aside-menu-hidden': isChatHiddenOnDesktop}">

    <Sidebar :navItems="navItems" :toggleSideBar="toggleSideBar" :toggleMobileSideBar="toggleMobileSideBar" />

    <Header :toggleSideBar="toggleSideBar" :toggleMobileSideBar="toggleMobileSideBar"></Header>

    <div class="app-body">
      <div class='menu-background'></div>
      <main class="main">
        <MobileSecondaryHeader />

        <infoBar :toggleChat="toggleChat"/>

        <GlobalChat :isChatShown="isChatShown" />

        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>

    <Footer></Footer>
    <CommonModals></CommonModals>
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

import GlobalChat from '../GlobalChat/ChatWrapper';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer';
import CommonModals from '../Modals/CommonModals';

import nav from './nav';

export default {
  name: 'AppShell',
  data: () => ({
    navItems: nav.items,
    isSideBarHidden: true,
    isMobileSidebarShown: false,
    isChatShown: false
  }),
  components: {
    Header,
    MobileSecondaryHeader,
    GlobalChat,
    InfoBar,
    Sidebar,
    Footer,
    CommonModals
  },
  computed: {
    isChatHiddenOnDesktop () {
      if (this.$mq === 'mobile') return true;

      return !this.isChatShown;
    }
  },
  methods: {
    toggleSideBar () {
      this.isSideBarHidden = !this.isSideBarHidden;
    },
    toggleMobileSideBar () {
      this.isMobileSidebarShown = !this.isMobileSidebarShown;
    },
    toggleChat () {
      this.isChatShown = !this.isChatShown;
    }
  }
};
</script>
