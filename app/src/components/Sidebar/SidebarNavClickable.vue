<template>
  <a href="javascript:void(0);" :class="classList" @click.prevent="handler">
    <i :class="icon"></i> {{name}}
  </a>
</template>

<script>
  export default {
    props: {
      name: {
        type: String,
        default: ''
      },
      classes: {
        type: String,
        default: ''
      },
      handler: {
        type: Function,
        default: null
      },
      icon: {
        type: String,
        default: ''
      },
    },
    computed: {
      classList () {
        return [
          'nav-link',
          ...this.itemClasses
        ];
      },
      itemClasses () {
        return this.classes ? this.classes.split(' ') : '';
      }
    }
  };
</script>
