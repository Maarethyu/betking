<template>
  <ChatWrapper :isChatShown="isChatShown">
    <template slot-scope="props">
      <b-row align-v="end" id="global-chat" class="global-chat">
        <b-col cols="12" align-self="end">
          <div id="chat-messages" class="chat-messages" @click="handleChatMessageClick">
            <div
              class="chat-item"
              :class="{'text-green': message.profit > 0, 'text-red': message.profit < 0}"
              v-for="message in messagesAndHighrollers" :key="`${message.username}-${message.date}`">
              <div class="chat-item-detail">
                <div class="chat-item-detail-date">{{ formatDate(message.date) }}</div>
                <div class="chat-item-detail-username" v-if="message.type !== 'HIGHROLLER' && message.type !== 'WELCOME_MESSAGE'">
                  <a href="#" :class="{'text-red': isUserModerator(message.username)}" @click.prevent="viewUserDetails(message.username)">{{ message.username }}</a>
                </div>
              </div>
              <div class="chat-item-text" :class="{'text-green': message.type === 'WELCOME_MESSAGE'}" v-html="formatMessage(message.message)"></div>
            </div>
          </div>
          <div class="chat-actions">
            <div class="chat-sign-in chat-input" v-if="!isAuthenticated">Sign in to chat</div>
            <div class="chat-input" v-if="isAuthenticated">
              <template v-if="chatLocked">
                <input type="text" class="form-control" placeholder="Chat disabled while shortcuts enabled" :disabled="chatLocked"/>
              </template>
              <template v-if="!isSocketConnected">
                <input type="text" class="form-control" placeholder="You are offline" :disabled="!isSocketConnected"/>
              </template>
              <template v-if="!chatLocked && isSocketConnected">
                <input type="text" class="form-control" :class="{'warning-shown': message.length > 205}" v-model="message" placeholder="Your message" @keyup.enter='send'/>
                <div class="message-length-warning" v-if="message.length > 205" :class="{'text-red': 255 - message.length < 0}">{{ 255 - message.length }}</div>
              </template>
            </div>
            <button class="btn btn-primary send-button" type="button" @click="send" :disabled="!isSocketConnected || chatLocked">
                SEND
            </button>
            <div class="online-users" v-on:click="showOnlineUsersDialog">
              {{ totalUsers }}&nbsp;<span class="fa fa-user"></span>
            </div>
            <div class="chat-lang">
              <div class="btn-group dropdown dropup">
                <button
                  type="button"
                  class="btn btn-sm btn-default dropdown-toggle"
                  data-toggle="dropdown"
                  data-boundary="viewport"
                  id="languageFilter" v-html="languageHtml({lang: currentLanguage, caret: true, long: false})" :disabled="!isSocketConnected" />
                  <div class="dropdown-menu">
                    <a class="dropdown-item" href="#"
                      v-for="language in chatLanguages" :key="language.short"
                      @click.prevent="switchChatLanguage(language.short)"
                      v-html="languageHtml({lang: language.short, caret: false, long: true})" />
                  </div>
              </div>
            </div>
          </div>
        </b-col>
        <OnlineUsersModal :users="users" @clearAllChat="clearAllChat"></OnlineUsersModal>
      </b-row>
    </template>
  </ChatWrapper>
</template>

<style lang="scss">
  .global-chat {
    height: 100%;
    .col-12 {
      height: 100%;
      justify-content: flex-end;
      display: flex;
      flex-flow: column nowrap;
    }
  }

  .chat-messages {
    /* height: 366px;
    max-height: 366px; */
    max-height: calc(100% - 34px);
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
</style>

<script>
  import bootstrap from 'bootstrap'; // eslint-disable-line no-unused-vars
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import $ from 'jquery';
  import {mapGetters} from 'vuex';
  import moment from 'moment';
  import bus from 'src/bus';

  import chatLanguages from './chat-languages';
  import {formatMessage, sortUsers} from './chat-helpers';
  import OnlineUsersModal from './OnlineUsersModal';
  import ChatWrapper from './ChatWrapper';

  export default {
    name: 'Chat',
    components: {
      OnlineUsersModal,
      ChatWrapper,
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      channels: [],
      currentLanguage: 'EN',
      message: '',
      chatLocked: false,
      chatLanguages
    }),
    props: {
      isChatShown: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ...mapGetters({
        chatChannels: 'chatChannels',
        username: 'username',
        // IgnoredUsers: 'IgnoredUsers',
        // HighrollerBetsInChat: 'HighrollerBetsInChat',
        // ShowHighrollersInChat: 'ShowHighrollersInChat',
        isChatOpened: 'isChatOpened',
        // LoadStateDone: 'LoadStateDone',
        isSocketConnected: 'isSocketConnected',
        welcomeMessages: 'welcomeMessages',
        moderators: 'moderators',
        isAuthenticated: 'isAuthenticated',
        totalUsers: 'totalOnlineUsers'
      }),
      messages () {
        return (this.chatChannels[this.currentLanguage] || {messages: []}).messages;
      },
      messagesAndHighrollers () {
        return this.filterMessages([...this.messages].sort((m1, m2) => {
          if (moment(m1.date).isSame(moment(m2.date))) {
            return 0;
          } else {
            return moment(m1.date).isAfter(moment(m2.date)) ? 1 : -1;
          }
        }));
      },
      users () {
        const users = this.chatChannels.users || [];
        return users.sort((u1, u2) => sortUsers(u1, u2, this.moderators));
      },
      anonymousUsers () {
        return this.chatChannels.anonymousUsers || 0;
      }
    },
    watch: {
      isChatOpened: function (newValue) { // eslint-disable-line object-shorthand
        if (newValue) {
          this.showWelcomeMessage();
          this.scrollToBottom();
        }
      },
      messagesAndHighrollers: function (newChats, oldChats) { // eslint-disable-line object-shorthand
        if (!Array.isArray(newChats) || !Array.isArray(oldChats)) {
          return false;
        }
        const lastNewChat = newChats[newChats.length - 1];
        const lastOldChat = oldChats[oldChats.length - 1];
        if (!lastNewChat || !lastOldChat) {
          this.scrollToBottom();
          return;
        }
        if (lastNewChat.date !== lastOldChat.date || lastNewChat.username !== lastOldChat.username) {
          this.scrollToBottom();
        }
      },
      currentLanguage: function (newLang, oldLang) { // eslint-disable-line object-shorthand
        if (newLang !== oldLang) {
          this.scrollToBottom();
        }
      },
      isSocketConnected: function (newValue) { // eslint-disable-line object-shorthand
        if (newValue) {
          this.loadChatMessages();
        }
      },
      isAuthenticated: function () { // eslint-disable-line object-shorthand
        if (this.isSocketConnected) {
          this.loadChatMessages();
        }
      },
      $mq: function () { // eslint-disable-line object-shorthand
        this.scrollToBottom();
        // this.attachDialogListeners();
      }
    },
    mounted () {
      bus.$on('lock-chat', (value) => {
        this.chatLocked = value;
      });
      // this.attachDialogListeners();
      this.scrollToBottom();
    },
    methods: {
      loadChatMessages () {
        if (this.channels.indexOf(this.currentLanguage) === -1) {
          this.addChannel(this.currentLanguage);
        }
      },
      filterMessages (messages) {
        // TODO: Add filter for ignoredUsers and showHighrollersInChat here
        return messages;
      },
      switchChatLanguage (language) {
        this.currentLanguage = language;
        this.loadChatMessages();
        this.showWelcomeMessage();
      },
      addChannel (language) {
        this.$store.dispatch('loadChatMessages', {language});
        this.channels.push(language);
      },
      send () {
        if (this.message.length <= 255) {
          const data = {
            language: this.currentLanguage,
            message: this.message
          };
          this.$store.dispatch('sendChatMessage', data);
          this.message = '';
        }
      },
      formatDate (date) {
        return moment(date).format('HH:mm');
      },
      formatMessage (message) {
        return formatMessage(message, this.username);
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
      },
      scrollToBottom () { // TODO: use scrollChatToBottom defined in Home.vue
        this.$nextTick(function () {
          const elem = $('#chat-messages')[0];
          elem.scrollTop = elem.scrollHeight;
        });
      },
      viewUserDetails (username) {
        bus.$emit('show-user-lookup-modal', username);
      },
      languageHtml ({lang, caret, long}) {
        const cl = this.chatLanguages.find(cl => cl.short === lang);
        const flagImg = `<img class="flag-img" width="15" src="${cl.flag}" alt="${cl.short}" />`;
        const longName = long ? cl.long : '';
        const caretHTML = caret ? '<span class="caret"></span>' : '';
        return `${longName} ${flagImg} ${caretHTML}`;
      },
      isUserModerator (username) {
        return this.moderators.indexOf(username) > -1;
      },
      showWelcomeMessage () {
        const msgAlreadyShown = this.welcomeMessages.findIndex(w => w.language === this.currentLanguage);
        if (msgAlreadyShown === -1) {
          if (this.chatChannels[this.currentLanguage]) {
            this.$store.dispatch('showChatWelcomeMessage', {language: this.currentLanguage});
          } else {
            bus.$once('chat-messages-loaded', language => {
              this.$store.dispatch('showChatWelcomeMessage', {language});
            });
          }
        }
      },
      clearAllChat () {
        this.$store.dispatch('clearAllChat', {language: this.currentLanguage});
      },
      showOnlineUsersDialog () {
        this.$root.$emit('bv::show::modal', 'onlineUsersModal');
      }
    }
  };
</script>
