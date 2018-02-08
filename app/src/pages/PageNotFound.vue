<template>
  <AppShellMinimal>
    <b-row>
      <b-col cols="8" offset="2">
        <h2>Page Not Found</h2>
        <br />
        <router-link :to="'/'">Go to home</router-link>
      </b-col>
    </b-row>
  </AppShellMinimal>
</template>

<script>
  import AppShellMinimal from 'components/AppShell/AppShellMinimal';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  export default {
    name: 'PageNotFound',
    components: {
      AppShellMinimal,
      'b-row': bRow,
      'b-col': bCol
    }
  };
</script>
