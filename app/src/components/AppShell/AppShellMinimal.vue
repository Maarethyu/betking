<template>
  <div class="app header-fixed sidebar-fixed"
    v-bind:class="{'sidebar-hidden': isSideBarHidden, 'sidebar-mobile-show': isMobileSidebarShown}">

    <Sidebar :navItems="navItems" :toggleSideBar="toggleSideBar" :toggleMobileSideBar="toggleMobileSideBar" />

    <Header :toggleSideBar="toggleSideBar" :toggleMobileSideBar="toggleMobileSideBar"></Header>

    <div class="app-body">
      <div class='menu-background'></div>
      <main class="main">
        <MobileSecondaryHeader />

        <div class="container-fluid">
          <slot></slot>
        </div>
      </main>
    </div>

    <Footer></Footer>
  </div>
</template>

<script>
  import Header from '../Header/Header';
  import MobileSecondaryHeader from '../Header/MobileSecondaryHeader';

  import Sidebar from '../Sidebar/Sidebar';
  import Footer from '../Footer';

  import nav from './nav';

  export default {
    name: 'AppShellMinimal',
    data: () => ({
      navItems: nav.items,
      isSideBarHidden: true,
      isMobileSidebarShown: false
    }),
    components: {
      Header,
      MobileSecondaryHeader,
      Sidebar,
      Footer
    },
    methods: {
      toggleSideBar () {
        this.isSideBarHidden = !this.isSideBarHidden;
      },
      toggleMobileSideBar () {
        this.isMobileSidebarShown = !this.isMobileSidebarShown;
      }
    }
  };
</script>
