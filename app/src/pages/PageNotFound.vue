<template>
  <div>
    Page Not Found
    <router-link :to="'/'">Index</router-link>
  </div>
</template>

<script>
export default {
  name: 'PageNotFound',
  created () {
    if (window.location.pathname !== '/404') {
      window.location.href = '/404';
    }
  }
};
</script>
