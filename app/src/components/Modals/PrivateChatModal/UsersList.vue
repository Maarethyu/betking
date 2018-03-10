<template>
  <b-row>
    <b-col cols="12" v-if="privateChatMessages.length > 0">
      <b-list-group>
        <b-list-group-item href="#"
          v-for="chat in privateChatMessages"
          :key="chat.otherUser"
          @click="joinPrivateChatWithUser(chat.lastChat)">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                {{chat.otherUser}}
                <b-badge variant="danger" v-if="chat.unreadCount">{{chat.unreadCount}}</b-badge>
              </div>
              <div>{{formatDate(chat.lastChat.date)}}</div>
            </div>
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <b-col cols="12" v-else>
      No recent conversations
    </b-col>
  </b-row>
</template>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bListGroup from 'bootstrap-vue/es/components/list-group/list-group';
  import bListGroupItem from 'bootstrap-vue/es/components/list-group/list-group-item';
  import bBadge from 'bootstrap-vue/es/components/badge/badge';

  import moment from 'moment';
  import {formatMessage} from 'components/GlobalChat/chat-helpers';
  import {mapGetters} from 'vuex';

  export default {
    name: 'PrivateChatUsersList',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      'b-list-group': bListGroup,
      'b-list-group-item': bListGroupItem,
      'b-badge': bBadge
    },
    computed: mapGetters({
      privateChatMessages: 'privateChatMessages',
      username: 'username'
    }),
    methods: {
      joinPrivateChatWithUser (chat) {
        this.$store.dispatch('setCurrentPrivateChatUser', this.otherUserDetails(chat));
      },
      otherUserDetails (chat) {
        return this.username !== chat.fromUsername
        ? {username: chat.fromUsername, userId: chat.fromUserId}
        : {username: chat.toUsername, userId: chat.toUserId};
      },
      otherUsername (chat) {
        return this.otherUserDetails(chat).username;
      },
      formatDate (date) {
        return moment(date).format('HH:mm');
      },
      formatMessage (message) {
        return formatMessage(message, this.username);
      }
    }
  };
</script>
