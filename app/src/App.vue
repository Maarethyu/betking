<template>
  <div id="app">
    <router-view name="menu"></router-view>
    <router-view></router-view>
  </div>
</template>

<script>
import Cookies from 'js-cookie';

export default {
  name: 'app',
  mounted () {
    this.scanForAffiliateId();
  },
  methods: {
    scanForAffiliateId () {
      const ref = this.searchObj().ref;

      if (ref) {
        Cookies.set('aff_id', ref, {expires: 1});
      }
    },
    searchObj () {
      const search = location.search.substring(1);
      return search
        ? JSON.parse(`{"${search.replace(/&/g, '","').replace(/=/g, '":"')}"}`,
          function (key, value) {
            return key === ''
              ? value
              : decodeURIComponent(value);
          })
        : {};
    }
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
