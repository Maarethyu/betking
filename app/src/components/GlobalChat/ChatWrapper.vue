<template>
  <b-collapse id="global-chat">
    <div class="global-chat-wrapper">
      <slot></slot>
    </div>
  </b-collapse>
</template>

<style lang="scss">
  .global-chat-wrapper {
    min-height: 400px;
  }
</style>


<script>
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';

export default {
  components: {
    'b-collapse': bCollapse
  }
};
</script>
