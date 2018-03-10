<template>
  <b-modal id="privateChatModal" ref="modal" size="lg" @hide="onModalHide" @shown="joinPrivateChat" hide-footer>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Private Chat</template>
    <b-container fluid>
      <UsersList v-if="!currentPrivateChatUser" />
      <PrivateChat v-if="currentPrivateChatUser" />

      <br /><br />
      <button class="btn btn-danger float-right" @click.prevent="hideModal">Close</button>
      <button class="btn btn-danger float-right mr-2" v-if="currentPrivateChatUser"
        @click.prevent="resetCurrentPrivateChatUser">Back</button>
      <button class="btn btn-danger float-left"
        v-if="!currentPrivateChatUser && privateChatMessages.length > 0"
        @click.prevent="archiveAllConversations">
        Archive All
      </button>

      <button class="btn btn-danger float-left"
        v-if="currentPrivateChatUser"
        @click.prevent="archiveConversation">
        Archive
      </button>
    </b-container>
  </b-modal>
</template>

<script>
  import bModal from 'components/modal/modal';
  import bContainer from 'bootstrap-vue/es/components/layout/container';

  import UsersList from './UsersList';
  import PrivateChat from './PrivateChat';

  import {mapGetters} from 'vuex';

  export default {
    name: 'PrivateChatModal',
    components: {
      'b-modal': bModal,
      'b-container': bContainer,
      UsersList,
      PrivateChat
    },
    computed: mapGetters({
      currentPrivateChatUser: 'currentPrivateChatUser',
      privateChatMessages: 'privateChatMessages',
      isAuthenticated: 'isAuthenticated'
    }),
    watch: {
      isAuthenticated (newValue) {
        if (newValue) {
          this.joinPrivateChat();
        }
      }
    },
    methods: {
      joinPrivateChat () {
        this.$store.dispatch('joinPrivateChat');
      },
      hideModal () {
        this.$refs.modal && this.$refs.modal.hide();
      },
      onModalHide () {
        this.resetCurrentPrivateChatUser();
      },
      resetCurrentPrivateChatUser () {
        this.$store.dispatch('resetCurrentPrivateChatUser');
      },
      archiveAllConversations () {
        this.$store.dispatch('archiveAllConversations');
        this.joinPrivateChat();
      },
      archiveConversation () {
        if (this.currentPrivateChatUser && this.currentPrivateChatUser.username) {
          this.$store.dispatch('archiveConversation', this.currentPrivateChatUser.username);
          this.resetCurrentPrivateChatUser();
          this.joinPrivateChat();
        }
      }
    }
  };
</script>
