<template>
  <footer class="app-footer">
    <div class='footer-content'>
      <router-link to='/' class='logo'><div class='footer-row'><img class='footer-logo' src='/static/img/logo.png'></div></router-link>
      <div class='footer-row'>
        <i class='fa fa-twitter'></i>
        <i class='fa fa-telegram'></i>
        <i class='fa fa-facebook'></i>
        <i class='fa fa-instagram'></i>
        <i class='fa fa-reddit'></i>
        <i class='fa fa-bitcoin'></i>
        <img class='gamble-aware' src='/static/img/gamble_aware.png' />
      </div>
      <div class='footer-row'>&copy; 2013-2017 BetKing S.R.L. Costa Rica Registration ID# 3-102-744110. All rights reserved.</div>
    </div>
  </footer>
</template>
<script>
export default {
  name: 'Footer'
};
</script>
