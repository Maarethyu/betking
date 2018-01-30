<template>
  <div class="app">
    <Sidebar :navItems="navItems"/>
    <Header></Header>
    <div class="app-body">
      <div class='menu-background'></div>
      <main class="main">
        <balanceBar/>
        <infoBar/>
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
import BalanceBar from '../Header/BalanceBar';
import InfoBar from '../Header/InfoBar';

import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer';

import nav from './nav';

export default {
  name: 'AppShell',
  data: () => ({
    navItems: nav.items
  }),
  components: {
    Header,
    BalanceBar,
    InfoBar,
    Sidebar,
    Footer
  }
};
</script>
