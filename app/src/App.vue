<template>
  <div id="app">
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

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Monda:400,700');
  @import url('https://fonts.googleapis.com/css?family=Roboto:400,500,600,700');

  $fa-font-path: '~font-awesome/fonts/';
  @import '~font-awesome/css/font-awesome.min.css';
  $simple-line-font-path: '~simple-line-icons/fonts/';
  @import '~simple-line-icons/css/simple-line-icons.css';
  @import '~bootstrap-vue/dist/bootstrap-vue.css';

  @import './scss/style';
</style>
