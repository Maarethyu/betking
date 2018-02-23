<template>
  <b-modal id="onlineUsersModal" ref="modal" hide-footer lazy>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Online users</template>

    <b-row class="online-users-list">
      <b-col cols="12" v-for="user of users" :key="user">
        <a class="text-red" href="#" @click.prevent="showUserDetailsDialog(user)">{{ user }}</a>
      </b-col>
    </b-row>

    <br>

    <b-button class="pull-right ml-2" size="sm" variant="danger" v-if="isChatModerator" @click="clearAllChat">
      Clear all chat
    </b-button>
    <b-button class="pull-right" size="sm" variant="default" @click="closeModal">
      Close
    </b-button>
    </b-modal>
</template>

<style>
.online-users-list {
  max-height: 400px;
  overflow: auto;
}
</style>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bModal from 'components/modal/modal';
  import bButton from 'bootstrap-vue/es/components/button/button';

  import {mapGetters} from 'vuex';
  import bus from 'src/bus';

  export default {
    name: 'OnlineUsersModal',
    components: {
      'b-modal': bModal,
      'b-row': bRow,
      'b-col': bCol,
      'b-button': bButton
    },
    props: {
      users: {
        type: Array,
        default: []
      }
    },
    computed: mapGetters({
      isChatModerator: 'isChatModerator'
    }),
    methods: {
      closeModal () {
        this.$refs.modal.hide();
      },
      showUserDetailsDialog (username) {
        this.closeModal();
        bus.$emit('show-user-lookup-modal', username);
      },
      clearAllChat () {
        this.$emit('clearAllChat');
      }
    }
  };
</script>
