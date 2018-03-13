<template>
  <b-modal id="notificationModal" ref="modal" size="lg" @hide="onModalHide" hide-footer>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Notifications</template>
    <b-container fluid>
      <div>
      </div>
      <b-list-group class="mb-10">
        <template v-for="notification in notifications">
          <notification :data="notification" />
        </template>
      </b-list-group>
      <button class="btn btn-danger float-right" @click.prevent="hideModal">Close</button>
    </b-container>
  </b-modal>
</template>

<script>
  import bModal from 'components/modal/modal';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bListGroup from 'bootstrap-vue/es/components/list-group/list-group';

  import notification from './notification';

  import {mapGetters} from 'vuex';

  export default {
    name: 'NotificationModal',
    components: {
      'b-modal': bModal,
      'b-container': bContainer,
      'b-list-group': bListGroup,
      notification
    },
    computed: {
      ...mapGetters({
        isAuthenticated: 'isAuthenticated',
        notifications: 'notifications'
      })
    },
    watch: {
      isAuthenticated (newValue) {
        if (newValue) {
          this.fetchNotifications();
        }
      }
    },
    mounted () {
      this.fetchNotifications();
    },
    methods: {
      fetchNotifications () {
        this.$store.dispatch('fetchNotifications');
      },
      hideModal () {
        this.$refs.modal && this.$refs.modal.hide();
      },
      onModalHide () {

      }
    }
  };
</script>
<style lang="scss">
  .mb-10 {
    margin-bottom: 10px;
  }
</style>
