<template>
  <router-link tag="li" class="nav-item nav-dropdown" :class="{'open': isDropdownOpen}" :to="url" disabled>
    <div class="nav-link nav-dropdown-toggle" @click.prevent="toggleSideBar"><i :class="icon"></i> {{name}}</div>
    <ul class="nav-dropdown-items">
      <slot></slot>
    </ul>
  </router-link>
</template>

<script>
export default {
  data: () => ({
    isDropdownOpen: false
  }),
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
    }
  },
  methods: {
    toggleSideBar () {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }
};
</script>
