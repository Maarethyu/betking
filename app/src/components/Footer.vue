<template>
  <footer class="app-footer">
    <div class='footer-content'>
      <router-link to='/' class='logo'><div class='footer-row'><img class='footer-logo' src='/static/img/logo.png'></div></router-link>
      <div class='footer-row'>
        <a href="https://twitter.com/betkingio" target="_blank" class='fa fa-twitter'></a>
        <a href="https://t.me/joinchat/GmNTqw7kaxhGRqsJhRuzzw" target="_blank" class='fa fa-telegram'></a>
        <a href="https://www.facebook.com/betkingcasino/" target="_blank" class='fa fa-facebook'></a>
        <a href="https://www.instagram.com/betkingcasino/" target="_blank" class='fa fa-instagram'></a>
        <a href="https://www.reddit.com/r/BetKing/" target="_blank" class='fa fa-reddit'></a>
        <a href="https://bitcointalk.org/index.php?topic=2150057" target="_blank" class='fa fa-bitcoin'></a>
        <a href="https://betking.io/responsible-gaming/" target="_blank"><img class='gamble-aware' src='/static/img/gamble_aware.png' /></a>
      </div>
      <div class='footer-row'>&copy; 2013-2017 BetKing S.R.L. Costa Rica Registration ID# 3-102-744110. All rights reserved.</div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
  a {
    text-decoration: none;
  }
</style>


<script>
export default {
  name: 'Footer'
};
</script>
