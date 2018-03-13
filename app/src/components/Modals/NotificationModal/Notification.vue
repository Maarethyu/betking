<template>
  <b-list-group-item @click="handleNotificationClick" class="notification-item">
    <b-row>
      <b-col cols="4">{{formatDate(data.created_at)}}</b-col>
      <b-col cols="6">{{data.title}}</b-col>
      <b-col cols="2" v-if="!data.is_read">
        <b-badge pill variant="danger">New</b-badge>
      </b-col>
    </b-row>
    <b-collapse :id="id" v-model="isOpen" class="m-1">
      <div v-html="data.body"></div>
    </b-collapse>
  </b-list-group-item>
</template>
<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
  import bListGroupItem from 'bootstrap-vue/es/components/list-group/list-group-item';
  import bBadge from 'bootstrap-vue/es/components/badge/badge';

  import moment from 'moment';

  export default {
    name: 'Notification',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      'b-collapse': bCollapse,
      'b-list-group-item': bListGroupItem,
      'b-badge': bBadge
    },
    computed: {
      id () {
        if (!this.data) {
          return null;
        } else {
          return `notification-item-${this.data.id}`;
        }
      }
    },
    props: {
      data: {
        required: true,
        default: null,
        type: Object
      }
    },
    data: () => ({
      isOpen: false
    }),
    methods: {
      formatDate (date) {
        return moment(date).format('M/D/YY h:mm a');
      },
      handleNotificationClick () {
        this.isOpen = !this.isOpen;
        if (!this.data.is_read) {
          this.$store.dispatch('markNotificationAsRead', this.data.id);
        }
      }
    }
  };
</script>
<style lang="scss">
  .notification-item {
    cursor: pointer;
  }
</style>
