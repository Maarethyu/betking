<template>
  <div v-if="!isComingSoon">
    <template v-if="isExternalLink">
      <a :href="url" :class="classList">
        <i :class="icon"></i> {{name}}
        <b-badge v-if="badge && badge.text" :variant="badge.variant">{{badge.text}}</b-badge>
      </a>
    </template>
    <template v-else>
      <router-link :to="url" :class="classList">
        <i :class="icon"></i> {{name}}
        <b-badge v-if="badge && badge.text" :variant="badge.variant">{{badge.text}}</b-badge>
      </router-link>
    </template>
  </div>
  <div v-else>
    <a href="javascript:void(0);" :class="classList" @click.prevent="">
      <i :class="icon"></i> {{name}}
      <b-badge variant="danger">Coming Soon</b-badge>
    </a>
  </div>
</template>

<style lang="scss">
  .sidebar .nav-link.nav-link-coming-soon {
    .badge {
      float: none;
      display: inline;
      position: relative;
      top: -1px;
      left: 8px;
    }
  }
</style>


<script>
  import bBadge from 'bootstrap-vue/es/components/badge/badge';

  export default {
    name: 'sidebar-nav-link',
    components: {
      'b-badge': bBadge
    },
    props: {
      name: {
        type: String,
        default: ''
      },
      url: {
        type: String,
        default: ''
      },
      icon: {
        type: String,
        default: ''
      },
      badge: {
        type: Object,
        default: () => {}
      },
      variant: {
        type: String,
        default: ''
      },
      isComingSoon: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      classList () {
        return [
          'nav-link',
          this.linkVariant,
          this.comingSoonClass
        ];
      },
      linkVariant () {
        return this.variant ? `nav-link-${this.variant}` : '';
      },
      comingSoonClass () {
        return this.isComingSoon ? `nav-link-coming-soon` : '';
      },
      isExternalLink () {
        if (this.url.substring(0, 4) === 'http') {
          return true;
        } else {
          return false;
        }
      }
    }
  };
</script>
