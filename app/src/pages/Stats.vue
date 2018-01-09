<template>
  <div>
    <router-link :to="'/'">Index</router-link>
    <br>
    Dummy Stats Page.<br>
    This route does not require user to be pre-fetched
  </div>
</template>

<script>
export default {
  name: 'Stats'
};
</script>
