import toastr from 'toastr';
import BigNumber from 'bignumber.js';

import * as types from '../mutation-types';
import bus from 'src/bus';
import api from 'src/api';

const state = {
  clientSeed: '',
  serverSeedHash: '',
  nonce: null,
  latestUserBets: [],
  minBetAmount: null,
  maxWin: null,
  isBettingDisabled: true,
  previousServerSeed: '',
  previousServerSeedHash: '',
  previousClientSeed: '',
  previousNonce: ''
};

// getters
const getters = {
  diceClientSeed: state => state.clientSeed,
  diceServerSeedHash: state => state.serverSeedHash,
  diceNonce: state => state.nonce,
  diceLatestBets: state => state.latestUserBets,
  diceMinBetAmount: state => state.minBetAmount,
  diceMaxWin: state => state.maxWin,
  diceIsBettingDisabled: state => state.isBettingDisabled,
  previousDiceServerSeed: state => state.previousServerSeed,
  previousDiceServerSeedHash: state => state.previousServerSeedHash,
  previousDiceClientSeed: state => state.previousClientSeed,
  previousDiceNonce: state => state.previousNonce
};

// actions
const actions = {
  loadDiceState ({commit, rootState}, {clientSeed, currency}) {
    commit(types.DISABLE_DICE_BETTING);

    api.loadDiceState(clientSeed, currency)
      .then(res => {
        const currencyConfig = rootState.funds.currencies.find(c => c.value === currency);
        const scale = currencyConfig.scale;

        const data = Object.assign({}, res.data, {
          minBetAmount: new BigNumber(res.data.minBetAmount)
            .div(new BigNumber(10).pow(scale))
            .toNumber(),
          maxWin: new BigNumber(res.data.maxWin)
          .div(new BigNumber(10).pow(scale))
          .toNumber()
        });

        commit(types.SET_DICE_STATE, data);
      });
  },

  diceBet ({commit}, {betAmount, currency, target, chance}) {
    commit(types.DISABLE_DICE_BETTING);

    api.diceBet(betAmount, currency, target, chance)
      .then(res => {
        const {id, date, bet_amount, currency, roll, profit, chance, target, balance, nextNonce} = res.data;
        commit(types.ADD_DICE_BET, {id, date, bet_amount, currency, roll, profit, chance, target});
        commit(types.SET_BALANCE, {currency, balance});
        commit(types.SET_DICE_NONCE, nextNonce);
        commit(types.ENABLE_DICE_BETTING);

        bus.$emit('dice-bet-result', {currency, roll, profit});
      })
      .catch(err => {
        if (err.response && err.response.data) {
          toastr.error(err.response.data.error);
          commit(types.ENABLE_DICE_BETTING);
        }

        throw err;
      });
  },

  setNewDiceClientSeed ({commit}, clientSeed) {
    api.setNewDiceClientSeed(clientSeed)
      .then(res => {
        toastr.success('Client seed changed');
        commit(types.SET_DICE_CLIENT_SEED, res.data.clientSeed);
      })
      .catch(err => {
        if (err.response && err.response.data && err.response.data.error) {
          toastr.error(err.response.data.error);
          return;
        }

        throw err;
      });
  },

  generateNewDiceSeed ({commit}, clientSeed) {
    api.generateNewDiceSeed(clientSeed)
      .then(res => {
        toastr.success('Seed generated');
        commit(types.UPDATE_PREVIOUS_AND_CURRENT_DICE_SEED, res.data);
      });
  }
};

// mutations
const mutations = {
  [types.SET_DICE_STATE] (state, data) {
    state.clientSeed = data.clientSeed;
    state.serverSeedHash = data.serverSeedHash;
    state.nonce = data.nonce;
    state.latestUserBets = data.latestUserBets;
    state.minBetAmount = data.minBetAmount;
    state.maxWin = data.maxWin;
    state.isBettingDisabled = data.isBettingDisabled;
  },

  [types.DISABLE_DICE_BETTING] (state) {
    state.isBettingDisabled = true;
  },

  [types.ENABLE_DICE_BETTING] (state) {
    state.isBettingDisabled = false;
  },

  [types.ADD_DICE_BET] (state, bet) {
    state.latestUserBets.splice(0, 0, bet);

    if (state.latestUserBets.length > 50) {
      state.latestUserBets.splice(50);
    }
  },

  [types.SET_DICE_CLIENT_SEED] (state, clientSeed) {
    state.clientSeed = clientSeed;
  },

  [types.UPDATE_PREVIOUS_AND_CURRENT_DICE_SEED] (state, data) {
    state.clientSeed = data.clientSeed;
    state.serverSeedHash = data.serverSeedHash;
    state.nonce = data.nonce;
    state.previousServerSeed = data.previousServerSeed;
    state.previousServerSeedHash = data.previousServerSeedHash;
    state.previousClientSeed = data.previousClientSeed;
    state.previousNonce = data.previousNonce;
  },

  [types.SET_DICE_NONCE] (state, nonce) {
    state.nonce = nonce;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
