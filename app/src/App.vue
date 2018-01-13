<template>
  <div id="app">
    <router-view name="menu"></router-view>
    <router-view></router-view>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import {getUrlParams} from './helpers';

export default {
  name: 'app',
  mounted () {
    this.scanForAffiliateId();
  },
  methods: {
    scanForAffiliateId () {
      const ref = getUrlParams().ref;

      if (ref) {
        Cookies.set('aff_id', ref, {expires: 1});
      }
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
