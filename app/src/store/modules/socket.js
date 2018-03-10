import socketIo from 'socket.io-client';
import toastr from 'toastr';
import Vue from 'vue';

import * as types from '../mutation-types';
import bus from 'src/bus';
import {addBetToList, formatBigAmount, formatCurrency, formatBetAsMessage} from 'src/helpers';

const state = {
  webSocket: null,
  watchBetsSocket: null,
  isSocketConnected: false,
  reconnectionCount: -2,
  watchBetsPaused: false,
  allBets: [],
  highrollerBets: [],
  highrollerBetsInChat: [],
  isChatOpened: false,
  chatChannels: {},
  bannedUsernames: [],
  isChatModerator: false,
  unreadChatMessages: 0,
  moderators: [],
  welcomeMessages: [],
  currentPrivateChatUser: null,
  privateChatMessages: [],
};

// getters
const getters = {
  webSocket: state => state.webSocket,
  isSocketConnected: state => state.isSocketConnected,
  reconnectionCount: state => state.reconnectionCount,
  allBets: state => state.allBets,
  highrollerBets: state => state.highrollerBets,
  watchBetsPaused: state => state.watchBetsPaused,
  chatChannels: state => state.chatChannels,
  highrollerBetsInChat: state => state.highrollerBetsInChat,
  isChatOpened: state => state.isChatOpened,
  welcomeMessages: state => state.welcomeMessages,
  moderators: state => state.moderators,
  totalOnlineUsers: state => {
    return state.chatChannels.users
      ? state.chatChannels.users.length + state.chatChannels.anonymousUsers
      : 0;
  },
  unreadChatMessages: state => state.unreadChatMessages,
  isChatModerator: state => state.isChatModerator,
  bannedUsernames: state => state.bannedUsernames,
  isPrivateChatDialogVisible: state => state.isPrivateChatDialogVisible,
  currentPrivateChatUser: state => state.currentPrivateChatUser,
  privateChatMessages: state => state.privateChatMessages,
  totalUnreadCount: state => {
    let totalCount = 0;

    state.privateChatMessages.forEach(c => {
      totalCount += c.unreadCount;
    });

    return totalCount;
  }
};

// actions
const actions = {
  setupSocket ({commit, state, rootState}) {
    if (!state.webSocket) {
      const socket = socketIo('/');

      socket.on('connect', () => {
        commit(types.SET_SOCKET_CONNECTION, true);
        commit(types.SET_SOCKET_RECONNECTION_COUNT, -2);
      });

      socket.on('connect_error', () => {
        socket.disconnect();
        commit(types.SET_SOCKET_CONNECTION, false);
        commit(types.SET_SOCKET_RECONNECTION_COUNT, state.reconnectionCount + 1);
      });

      socket.on('disconnect', () => {
        commit(types.SET_SOCKET_RECONNECTION_COUNT, state.reconnectionCount + 1);
        if (state.reconnectionCount < 0) {
          return;
        }
        socket.disconnect();
        commit(types.SET_SOCKET_CONNECTION, false);
      });

      socket.on('depositConfirmed', (msg) => {
        const amount = formatBigAmount.call(rootState.funds, msg.amount, msg.currency);
        const currencySymbol = formatCurrency.call(rootState.funds, msg.currency, 'symbol');
        toastr.info(`Deposit of ${amount} ${currencySymbol} received.`);

        commit(types.SET_BALANCE, {currency: msg.currency, balance: msg.balance});

        const isOnWalletsPage = rootState.route.name === 'wallet';
        if (isOnWalletsPage) {
          bus.$emit('DEPOSIT_CONFIRMED');
        }
      });

      socket.on('statsUpdate', (msg) => {
        commit(types.SET_SITE_STATS, msg.siteStats);
        commit(types.SET_BET_STATS, msg.totalBets);
        commit(types.SET_WON_LAST_24HOURS, {
          wonLast24Hours: msg.wonLast24Hours,
          currencies: rootState.funds.currencies
        });
      });

      socket.on('newChatMessage', ({message, appId, language}) => {
        commit(types.ADD_CHAT_MESSAGE, {
          message: {
            date: message.date,
            message: message.message,
            userId: message.userId,
            username: message.username
          },
          language
        });
      });

      socket.on('chatMessages', ({messages, users, anonymousUsers, language, isModerator, bannedUsernames, moderators}) => {
        commit(types.SET_CHAT_MESSAGES, {
          messages: messages.map((message) => {
            return {
              date: message.date,
              message: message.message,
              userId: message.userId,
              username: message.username
            };
          }),
          users,
          anonymousUsers,
          language
        });
        commit(types.SET_MODERATORS, moderators);
        commit(types.SET_IS_CHAT_MODERATOR, isModerator);

        if (isModerator) {
          commit(types.SET_BANNED_USERNAMES, bannedUsernames);
        } else {
          commit(types.SET_BANNED_USERNAMES, []);
        }

        bus.$emit('chat-messages-loaded', language);
      });

      socket.on('chatAnonymousUserCount', ({count}) => {
        commit(types.SET_CHAT_ANONYMOUS_USER_COUNT, count);
      });

      socket.on('chatNewUser', ({username}) => {
        commit(types.ADD_CHAT_NEW_USER, username);
      });

      socket.on('chatDeletedUser', ({username}) => {
        commit(types.DELETE_CHAT_USER, username);
      });

      socket.on('chatBannedUser', ({username}) => {
        const bannedUsernames = state.bannedUsernames.slice();
        bannedUsernames.push(username);
        if (state.isChatModerator) {
          commit(types.SET_BANNED_USERNAMES, bannedUsernames);
          toastr.info(`${username} banned from chat.`);
        }
      });

      socket.on('chatUnbannedUser', ({username}) => {
        const bannedUsernames = state.bannedUsernames.slice();
        const bannedUserIdx = bannedUsernames.indexOf(username);
        if (bannedUserIdx !== -1) {
          bannedUsernames.splice(bannedUserIdx, 1);
        }
        if (state.isChatModerator) {
          commit(types.SET_BANNED_USERNAMES, bannedUsernames);
          toastr.info(`${username} unbanned from chat.`);
        }
      });

      socket.on('clearAllChat', (msg) => {
        commit(types.CLEAR_ALL_CHAT, msg);
      });

      socket.on('clearUsersChat', (msg) => {
        commit(types.CLEAR_USERS_CHAT, msg);
      });

      socket.on('newPrivateMessage', (message) => {
        if (rootState.account.ignoredUsers.indexOf(message.fromUsername) === -1) {
          commit(types.ADD_PRIVATE_CHAT_MESSAGE, {message, username: rootState.account.username});
        }
      });

      socket.on('privateChatMessages', (chats) => {
        const isIgnored = (username) => rootState.account.ignoredUsers.indexOf(username) !== -1;

        chats.forEach((chat, idx) => {
          if (isIgnored(chat.fromUsername) || isIgnored(chat.toUsername)) {
            chats.splice(idx, 1);
          }
        });

        commit(types.SET_PRIVATE_CHATS, {chats, username: rootState.account.username});
      });

      socket.on('privateChatMessagesWithUser', (msg) => {
        if (rootState.account.ignoredUsers.indexOf(msg.username) === -1) {
          commit(types.RESET_PRIVATE_CHAT_MESSAGES_FOR_USER, msg);
        }
      });

      socket.on('highrollerBet', (bet) => {
        const betAmount = formatBigAmount.call(rootState.funds, bet.bet_amount, bet.currency);
        const profit = formatBigAmount.call(rootState.funds, bet.profit, bet.currency);
        const currencySymbol = formatCurrency.call(rootState.funds, bet.currency, 'symbol');

        const betMessage = formatBetAsMessage(bet.id, bet.date, bet.username, betAmount, currencySymbol, profit);
        commit(types.ADD_TO_HIGHROLLER_BETS_IN_CHAT, betMessage);
      });

      commit(types.SET_WEBSOCKET, socket);
    }
  },

  restartSocket ({commit, state}) {
    if (state.webSocket) {
      state.webSocket.disconnect();
      state.webSocket.connect();
    }
  },

  setSocketReconnectionCount ({commit}, count) {
    commit(types.SET_SOCKET_RECONNECTION_COUNT, count);
  },

  setIsChatOpened ({commit}, isChatOpened) {
    commit(types.SET_IS_CHAT_OPENED, isChatOpened);
  },

  clearChatChannels ({commit}) {
    commit(types.CLEAR_CHAT_CHANNELS);
  },

  loadChatMessages ({commit, state, rootState}, {language}) {
    state.webSocket.emit('joinChat', {language, requesterName: rootState.account.username});
  },

  sendChatMessage ({commit, state}, {language, message}) {
    state.webSocket.emit('newChatMessage', {language, message});
  },

  banUserFromChat ({commit, state}, username) {
    state.webSocket.emit('banUser', {username});
  },

  unBanUserFromChat ({commit, state}, username) {
    state.webSocket.emit('unBanUser', {username});
  },

  clearAllChat ({commit, state}, {language}) {
    state.webSocket.emit('clearAllChat', {language});
  },

  clearUsersChat ({commit, state}, username) {
    state.webSocket.emit('clearUsersChat', {username});
  },

  setCurrentPrivateChatUser ({commit}, {username, userId}) {
    commit(types.SET_CURRENT_PRIVATE_CHAT_USER, {username, userId});
  },

  resetCurrentPrivateChatUser ({commit}) {
    commit(types.RESET_CURRENT_PRIVATE_CHAT_USER);
  },

  sendPrivateChat ({commit, state}, {toUsername, toUserId, message}) {
    state.webSocket.emit('privateChatMessage', {toUsername, toUserId, message});
  },

  markChatAsRead ({commit, state}, {username}) {
    state.webSocket.emit('markPrivateChatAsRead', {username});
  },

  joinPrivateChat ({commit, state, rootState}) {
    if (!rootState.account.isAuthenticated) return;
    state.webSocket.emit('joinPrivateChat', {});
  },

  joinPrivateChatWithUser ({commit, state}, {username}) {
    state.webSocket.emit('joinPrivateChatWithUser', {username});
  },

  archiveConversation ({commit, state}, username) {
    state.webSocket.emit('archiveConversation', {username});
  },
  archiveAllConversations ({commit, state}) {
    state.webSocket.emit('archiveAllConversations', {});
  },

  showChatWelcomeMessage ({commit}) {

  },

  watchBets ({commit, state}) {
    if (state.watchBetsSocket) {
      state.watchBetsSocket.connect();
      state.watchBetsSocket.emit('loadBets');
      return;
    }

    if (!state.watchBetsSocket) {
      const watchBetsSocket = socketIo('/watch-bets');

      watchBetsSocket.on('connect', () => {
        console.log('watch bets socket connected');
        watchBetsSocket.emit('loadBets');
      });

      watchBetsSocket.on('loadAllBets', (response) => {
        commit(types.SET_ALL_BETS, response.allBets);
        commit(types.SET_HIGHROLLER_BETS, response.highrollerBets);
      });

      watchBetsSocket.on('diceBet', (bet) => {
        if (state.watchBetsPaused) {
          return;
        }

        if (bet.isHighrollerBet) {
          commit(types.ADD_TO_HIGHROLLER_BETS, bet);
        }

        commit(types.ADD_TO_ALL_BETS, bet);
      });

      watchBetsSocket.on('disconnect', () => {
        console.log('watch bets socket disconnected');
      });

      commit(types.SET_WATCH_BETS_WEBSOCKET, watchBetsSocket);
    }
  },

  stopWatchingBets ({commit, state}) {
    if (!state.watchBetsSocket) {
      return;
    }

    state.watchBetsSocket.disconnect();
  },

  toggleWatchBetsPaused ({commit}, shouldPause) {
    commit(types.SET_WATCH_BETS_PAUSED, shouldPause);
  }
};

// mutations
const mutations = {
  [types.SET_WEBSOCKET] (state, socket) {
    state.webSocket = socket;
  },

  [types.SET_SOCKET_CONNECTION] (state, isSocketConnected) {
    state.isSocketConnected = isSocketConnected;
  },

  [types.SET_SOCKET_RECONNECTION_COUNT] (state, reconnectionCount) {
    state.reconnectionCount = reconnectionCount;
  },

  [types.SET_WATCH_BETS_WEBSOCKET] (state, socket) {
    state.watchBetsSocket = socket;
  },

  [types.SET_ALL_BETS] (state, bets) {
    state.allBets = bets;
  },

  [types.SET_HIGHROLLER_BETS] (state, bets) {
    state.highrollerBets = bets;
  },

  [types.ADD_TO_ALL_BETS] (state, bet) {
    addBetToList(state.allBets, bet);
  },

  [types.ADD_TO_HIGHROLLER_BETS] (state, bet) {
    addBetToList(state.highrollerBets, bet);
  },

  [types.ADD_TO_HIGHROLLER_BETS_IN_CHAT] (state, bet) {
    addBetToList(state.highrollerBetsInChat, bet);
  },

  [types.SET_WATCH_BETS_PAUSED] (state, shouldPause) {
    state.watchBetsPaused = shouldPause;
  },

  [types.ADD_CHAT_MESSAGE] (state, {message, language}) {
    if (state.chatChannels[language]) {
      Vue.set(state.chatChannels[language].messages, state.chatChannels[language].messages.length, message);
      const messageCount = state.chatChannels[language].messages.length;
      state.chatChannels[language].messages.splice(0, messageCount - 100);
      if (!state.isChatOpened) {
        state.unreadChatMessages++;
      }
    }
  },

  [types.SET_CHAT_MESSAGES] (state, {messages, users, anonymousUsers, language}) {
    Vue.set(state.chatChannels, language, state.chatChannels[language] || {messages: []});
    state.chatChannels[language].messages.push(...messages);
    Vue.set(state.chatChannels, 'users', users);
    Vue.set(state.chatChannels, 'anonymousUsers', anonymousUsers);
  },

  [types.CLEAR_CHAT_CHANNELS] (state) {
    state.chatChannels = {};
  },

  [types.SET_CHAT_ANONYMOUS_USER_COUNT] (state, count) {
    if (state.chatChannels) {
      Vue.set(state.chatChannels, 'anonymousUsers', count);
    }
  },

  [types.ADD_CHAT_NEW_USER] (state, username) {
    if (state.chatChannels && state.chatChannels.users && state.chatChannels.users.indexOf(username) === -1) {
      Vue.set(state.chatChannels.users, state.chatChannels.users.length, username);
    }
  },

  [types.DELETE_CHAT_USER] (state, username) {
    if (state.chatChannels) {
      const index = state.chatChannels.users.indexOf(username);
      if (index !== -1) {
        state.chatChannels.users.splice(index, 1);
      }
    }
  },

  [types.SET_IS_CHAT_MODERATOR] (state, isChatModerator) {
    state.isChatModerator = isChatModerator;
  },

  [types.SET_BANNED_USERNAMES] (state, bannedUsernames) {
    state.bannedUsernames = bannedUsernames;
  },

  [types.SET_IS_CHAT_OPENED] (state, isChatOpened) {
    state.isChatOpened = isChatOpened;
    if (isChatOpened) {
      state.unreadChatMessages = 0;
    }
  },

  [types.CLEAR_ALL_CHAT] (state, {language}) {
    Vue.set(state.chatChannels, language, {messages: []});
  },

  [types.CLEAR_USERS_CHAT] (state, {username}) {
    Object.keys(state.chatChannels).forEach(language => {
      if (state.chatChannels[language].messages) {
        const chMesssages = state.chatChannels[language].messages;

        const filteredMessages = Array.isArray(chMesssages)
          ? chMesssages.filter(msg => msg.username !== username)
          : [];

        Vue.set(state.chatChannels, language, {messages: filteredMessages});
      }
    });
  },

  [types.SET_CURRENT_PRIVATE_CHAT_USER] (state, {username, userId}) {
    state.currentPrivateChatUser = {username, userId};

    const {privateChatMessages} = state;

    const messagesIndex = privateChatMessages.findIndex(messagesWithUser => messagesWithUser.otherUser === username);
    if (messagesIndex !== -1) {
      Vue.set(privateChatMessages[messagesIndex], 'unreadCount', 0);
    }
  },

  [types.RESET_CURRENT_PRIVATE_CHAT_USER] (state) {
    state.currentPrivateChatUser = null;
  },

  [types.SET_PRIVATE_CHATS] (state, {chats, username}) {
    state.privateChatMessages = chats.map(message => ({
      otherUser: username !== message.fromUsername ? message.fromUsername : message.toUsername,
      messages: [],
      unreadCount: message.unreadCount,
      lastChat: message
    }));
  },

  [types.ADD_PRIVATE_CHAT_MESSAGE] (state, {message, username}) {
    const {privateChatMessages, currentPrivateChatUser} = state;

    const messagesIndex = privateChatMessages.findIndex(messagesWithUser =>
      (messagesWithUser.otherUser === message.fromUsername || messagesWithUser.otherUser === message.toUsername));

    if (messagesIndex !== -1) {
      Vue.set(privateChatMessages[messagesIndex], 'messages', [...privateChatMessages[messagesIndex].messages, message]);
      const updatedUnreadCount = currentPrivateChatUser && currentPrivateChatUser.username === privateChatMessages[messagesIndex].otherUser
        ? 0
        : privateChatMessages[messagesIndex].unreadCount + 1;

      Vue.set(privateChatMessages[messagesIndex], 'unreadCount', updatedUnreadCount);
    } else {
      Vue.set(privateChatMessages, privateChatMessages.length, {
        lastChat: message,
        otherUser: username !== message.fromUsername ? message.fromUsername : message.toUsername,
        messages: [message],
        unreadCount: 1
      });
    }
  },

  [types.RESET_PRIVATE_CHAT_MESSAGES_FOR_USER] (state, {messages, username}) {
    const {privateChatMessages, currentPrivateChatUser} = state;

    const messagesIndex = privateChatMessages.findIndex(messagesWithUser => messagesWithUser.otherUser === username);
    Vue.set(state.privateChatMessages, messagesIndex !== -1 ? messagesIndex : privateChatMessages.length, {
      otherUser: username,
      messages: messages.reverse(),
      lastChat: messages[messages.length - 1],
      unreadCount: currentPrivateChatUser && currentPrivateChatUser.username === username ? 0 : messages.length
    });
  },

  [types.SET_MODERATORS] (state, moderators) {
    state.moderators = moderators;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
