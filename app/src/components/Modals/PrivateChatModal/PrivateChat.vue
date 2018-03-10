<template>
  <b-row align-v="end" id="private-chat" class="private-chat">
    <b-col cols="12" align-self="end">
      <div id="private-chat-messages" class="chat-messages" @click="handleChatMessageClick">
        <div
          class="chat-item"
          v-for="message in messages" :key="`${message.username}-${message.date}`">
          <div class="chat-item-detail">
            <div class="chat-item-detail-date">{{ formatDate(message.date) }}</div>
            <div class="chat-item-detail-username">
              <a href="#" :class="{'text-red': isUserModerator(message.fromUsername)}" @click.prevent="viewUserDetails(message.fromUsername)">{{ fromUsername(message) }}</a>
            </div>
          </div>
          <div class="chat-item-text" v-html="formatMessage(message.message)"></div>
        </div>
      </div>
      <div class="chat-actions">
        <div class="chat-sign-in chat-input" v-if="!isAuthenticated">Sign in to chat</div>
        <div class="chat-input" v-if="isAuthenticated">
          <template v-if="!isSocketConnected">
            <input type="text" class="form-control" placeholder="You are offline" :disabled="!isSocketConnected"/>
          </template>
          <template v-else>
            <input type="text" class="form-control" :class="{'warning-shown': message.length > 205}" v-model="message" placeholder="Your message" @keyup.enter='send'/>
            <div class="message-length-warning" v-if="message.length > 205" :class="{'text-red': 255 - message.length < 0}">{{ 255 - message.length }}</div>
          </template>
        </div>
        <button class="btn btn-primary send-button" type="button" @click="send" :disabled="!isSocketConnected">
            SEND
        </button>
      </div>
    </b-col>
  </b-row>
</template>

<style lang="scss">
  .private-chat {
    height: 100%;
    .col-12 {
      height: 100%;
      justify-content: flex-end;
      display: flex;
      flex-flow: column nowrap;
    }

    .chat-messages {
      max-height: 400px;
      overflow-y: auto;
    }

    .chat-actions {
      height: 34px;
      background-color: #374850;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: space-between;
    }

    .chat-actions input.form-control {
      width: 100%;
      max-width: 100%;
      text-align: left;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .chat-actions input.form-control.warning-shown {
      padding-right: 33px;
    }

    .chat-actions .chat-sign-in {
      padding-top: 5px;
      padding-left: 10px;
    }

    .chat-item {
      margin: 0 20px;
      padding: 5px 0;
      vertical-align: top;
      min-height: 1.5em;
    }

    .chat-item:last-child {
      padding-bottom: 10px;
    }

    .chat-item .chat-item-detail .chat-item-detail-date {
      float:right;
      color:#878e92;
    }

    .chat-item .chat-item-detail .chat-item-detail-username {
      font-weight: bold;
      color:#878e92;
    }

    .chat-item .chat-item-text {
      padding-right: 20px;
      word-wrap: break-word;
      width: 95%;
    }

    .chat-item-text a{
      color: #ff2a68;
    }

    .chat-item.text-green .chat-item-text a {
      color: #8EC919;
    }

    .mention{
      color: #ff2a68;
    }

    .message-length-warning {
      position: absolute;
      right: 0;
      bottom: 2px;
      margin-right: 4px;
      padding: 5px;
    }

    .chat-lang {
      right: 0;
      top: 0;
    }

    .chat-lang .dropdown-menu {
      left: auto;
      right: 0;
      width: 120px;
      max-width: 120px;
    }

    .chat-lang .dropdown-toggle {
      border-radius: 0;
      padding: 6px;
      height: 34px;
    }

    .chat-actions .online-users {
      height: 34px;
      font-size: 13px;
      color: #878e92;
      background-color: #303E46;
      padding: 10px 6px 6px;
      white-space: nowrap;
      cursor: pointer;
    }

    @media only screen and (max-width: 480px) {
      .chat-actions .online-users {
        display: none;
      }
    }

    .chat-input {
      width: 100%;
      position: relative;
    }
  }
</style>


<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import $ from 'jquery';
  import {mapGetters} from 'vuex';
  import moment from 'moment';
  import bus from 'src/bus';
  import {formatMessage} from 'components/GlobalChat/chat-helpers';

  export default {
    name: 'PrivateChatMessageList',
    components: {
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      message: ''
    }),
    computed: {
      ...mapGetters({
        username: 'username',
        currentPrivateChatUser: 'currentPrivateChatUser',
        privateChatMessages: 'privateChatMessages',
        moderators: 'moderators',
        isAuthenticated: 'isAuthenticated',
        isSocketConnected: 'isSocketConnected'
      }),
      messages () {
        const messageList = this.currentPrivateChatUser && this.currentPrivateChatUser.username &&
          (this.privateChatMessages.find(messageList => messageList.otherUser === this.currentPrivateChatUser.username) || []);
        return messageList && (messageList.messages || []);
      }
    },
    mounted () {
      this.scrollChatToBottom();
      if (this.currentPrivateChatUser) {
        this.$store.dispatch('joinPrivateChatWithUser', {username: this.currentPrivateChatUser.username});
      }
    },
    watch: {
      messages: function () {  // eslint-disable-line object-shorthand
        this.markChatAsRead();
        this.scrollChatToBottom();
      }
    },
    updated () {
      this.scrollChatToBottom();
    },
    methods: {
      send () {
        if (this.message.length <= 255 && this.currentPrivateChatUser) {
          const data = {
            toUsername: this.currentPrivateChatUser.username,
            toUserId: this.currentPrivateChatUser.userId,
            message: this.message
          };
          this.message = '';
          this.$store.dispatch('sendPrivateChat', data);
        }
      },
      markChatAsRead () {
        if (!this.currentPrivateChatUser) {
          return;
        }

        const isAnyMessageUnread = this.messages.some(msg => msg.fromUsername === this.currentPrivateChatUser.username && msg.isRead === false);
        if (isAnyMessageUnread) {
          this.$store.dispatch('markChatAsRead', {username: this.currentPrivateChatUser.username});
        }
      },
      formatDate (date) {
        return moment(date).format('HH:mm');
      },
      formatMessage (message) {
        return formatMessage(message, this.UserName);
      },
      scrollChatToBottom () {
        this.$nextTick(function () {
          const elem = $('#private-chat-messages')[0];

          window.setTimeout(() => {
            if (!elem) return;

            elem.scrollTop = elem.scrollHeight;
          }, 100);
        });
      },
      viewUserDetails (username) {
        bus.$emit('show-user-lookup-modal', username);
      },
      resetCurrentChatUser () {
        this.$store.dispatch('resetCurrentPrivateChatUser');
      },
      fromUsername (message) {
        return message.fromUsername === this.username ? 'Me' : message.fromUsername;
      },
      isUserModerator (username) {
        return this.moderators.indexOf(username) > -1;
      },
      archiveConversation () {
        if (this.currentPrivateChatUser) {
          this.$store.dispatch('archiveConversation', this.currentPrivateChatUser.username);
          this.resetCurrentChatUser();
        }
      },
      handleChatMessageClick (e) {
        const target = e.target;

        if ($(target).hasClass('chat-body-betid')) {
          e.preventDefault();
          const betId = parseInt($(target).data('id'), 10);
          bus.$emit('show-bet-details-modal', betId);
        }

        if ($(target).hasClass('chat-body-username')) {
          e.preventDefault();
          const username = $(target).data('username');
          bus.$emit('show-user-lookup-modal', username);
        }
      }
    }
  };
</script>
