<template>
  <div>
    <mq-layout mq="mobile">
      <b-collapse id="global-chat" v-model="isChatShown">
        <div class="chat-wrapper-mobile">
          <slot :device="$mq"></slot>
        </div>
      </b-collapse>
    </mq-layout>

    <mq-layout mq="desktop">
      <aside class="aside-menu" id="aside-chat-wrapper">
        <slot :device="$mq"></slot>
      </aside>
    </mq-layout>
  </div>
</template>

<style lang="scss" scoped>
  .chat-wrapper-mobile {
    height: 400px;
    overflow: hidden;
  }
  .aside-menu {
    top: 60px;
    height: calc(100% - 60px);
  }
</style>


<script>
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
// import Chat from './Chat';

export default {
  name: 'ChatWrapper',
  components: {
    'b-collapse': bCollapse,
    // Chat
  },
  props: {
    isChatShown: {
      type: Boolean,
      default: false
    }
  }
};
</script>
