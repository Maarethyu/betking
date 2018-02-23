<template>
  <b-modal id="userLookupModal" ref="modal" lazy @hide="onModalHide" @shown="onModalShow">
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">
      <div>User Lookup</div>
    </template>
    <template v-if="!isSearch">
      <div class="alert alert-danger" v-if="errors.global">{{errors.global}}</div>
      <div class="alert alert-danger" v-if="errors.username">{{errors.username}}</div>
    </template>
    <template v-if="isSearch">
      <b-form-group :invalid-feedback="userNotFoundMessage" :state="fetchSuccess">
        <b-input-group prepend="User Name">
          <b-form-input id="username"
                        type="text"
                        placeholder="Enter the username"
                        v-model="serachTerm"
                        @keyup.native.enter="fetchUserStats(serachTerm)">
          </b-form-input>
          <b-input-group-append>
            <b-btn size="sm" class="btn btn-primary" variant="primary" @click.prevent="fetchUserStats(serachTerm)">
              <i class="fa fa-search"></i> Search</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
    </template>
    <b-container fluid class="text-center">
      <template v-if="fetchingData">
        <b-row class="pbm text-center">
          <b-col>Fetching User Details.</b-col>
        </b-row>
      </template>
      <template v-if="fetchSuccess">
        <b-row>
          <b-col cols="12" class="user-details__title">{{user.username}}</b-col>
          <b-col cols="12" class="user-details__date">Joined on {{formatDate(user.dateJoined)}}</b-col>
        </b-row>

        <b-row v-if="loggedInUser !== user.username && isAuthenticated">
          <b-col cols="4">
            <b-btn variant="default" disabled><i class="fa fa-btc"></i>&nbsp;Send Tip</b-btn>
          </b-col>

          <b-col cols="4">
            <b-btn variant="default" disabled><i class="fa fa-comments-o"></i>&nbsp;Private chat</b-btn>
          </b-col>

          <b-col cols="4">
            <b-btn variant="danger" disabled><i class="fa fa-ban"></i>&nbsp;Ignore User</b-btn>
          </b-col>
        </b-row>

        <br />

        <b-row v-if="loggedInUser !== user.username && isAuthenticated && isChatModerator">
          <b-col cols="6">
            <b-btn v-if="!isUserBanned(user.username)" variant="danger" @click="banUser"><i class="fa fa-ban"></i>&nbsp;Ban user</b-btn>
            <b-btn v-if="isUserBanned(user.username)" variant="success" @click="unBanUser"><i class="fa fa-ban"></i>&nbsp;Unban user</b-btn>
          </b-col>

          <b-col cols="6">
            <b-btn variant="danger" @click="clearUsersChat"><i class="fa fa-ban"></i>&nbsp;Clear Chat</b-btn>
          </b-col>
        </b-row>

        <template v-if="stats">
          <b-row class="user-details__stat" v-for="stat in stats" :key="stat.currency">
            <b-col cols="2" class="user-details__currency"><CurrencyIcon :id="stat.currency" :width="30" /></b-col>
            <b-col cols="10">
              <b-row>
                <b-col cols="4">
                  <div class="user-details__stat__key">BETS</div>
                  <div class="user-details__stat__value">{{stat.totalBets}}</div>
                </b-col>
                <b-col cols="4">
                  <div class="user-details__stat__key">PROFIT</div>
                  <div v-html="formatProfit(stat.profits, stat.currency)" class="user-details__stat__value"></div>
                </b-col>
                <b-col cols="4">
                  <div class="user-details__stat__key">WAGERED</div>
                  <div v-html="formatBigAmount(stat.totalWagered, stat.currency)" class="user-details__stat__value"></div>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </template>
        <template v-if="!stats">
          <b-row>
            <b-col>This user has hidden stats.</b-col>
          </b-row>
        </template>
      </template>
    </b-container>
     <div slot="modal-footer" class="w-100">
       <b-btn size="sm" class="btn btn-danger float-right mr-2" variant="primary" @click.prevent="closeModal">
         Close
       </b-btn>
     </div>
  </b-modal>
</template>

<script>
import {mapGetters} from 'vuex';
import moment from 'moment';

import bModal from 'bootstrap-vue/es/components/modal/modal';
import vBModal from 'bootstrap-vue/es/directives/modal/modal';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bRow from 'bootstrap-vue/es/components/layout/row';
import bCol from 'bootstrap-vue/es/components/layout/col';
import bButton from 'bootstrap-vue/es/components/button/button';
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-addon';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

import api from 'src/api';
import {formatBigAmount} from 'src/helpers';
import CurrencyIcon from 'components/CurrencyIcon';
import bus from 'src/bus';

export default {
  name: 'UserLookupModal',
  components: {
    'b-modal': bModal,
    'b-container': bContainer,
    'b-row': bRow,
    'b-col': bCol,
    'b-btn': bButton,
    'b-input-group': bInputGroup,
    'b-input-group-append': bInputGroupAppend,
    'b-form-group': bFormGroup,
    'b-form-input': bFormInput,
    CurrencyIcon
  },
  directives: {
    'b-modal': vBModal
  },
  computed: {
    ...mapGetters({
      currencies: 'currencies',
      loggedInUser: 'username',
      isAuthenticated: 'isAuthenticated',
      isChatModerator: 'isChatModerator',
      bannedUsernames: 'bannedUsernames'
    })
  },
  data: () => ({
    errors: {},
    stats: [],
    user: null,
    serachTerm: '',
    fetchSuccess: null,
    fetchingData: false,
    userNotFoundMessage: 'Sorry, we could not fetch data for this user.',
    isSearch: false
  }),
  props: {
    username: {
      type: String,
      default: null
    }
  },
  methods: {
    formatBigAmount,
    onModalShow () {
      if (this.username) {
        this.isSearch = false;
        this.fetchUserStats(this.username);
      } else {
        this.isSearch = true;
      }
    },
    formatProfit (amount, currency) {
      const className = amount > 0 ? 'text-green' : 'text-red';

      return `<span class="${className}">${this.formatBigAmount(amount, currency)}</span>`;
    },
    closeModal () {
      this.$refs.modal && this.$refs.modal.hide();
    },
    onModalHide () {
      bus.$emit('bet-details-modal-closed');
      this.errors = {};
      this.user = null;
      this.stats = null;
      this.serachTerm = '';
      this.fetchingData = false;
      this.fetchSuccess = null;
    },
    fetchUserStats (username) {
      if (!username) return;
      this.fetchingData = true;
      api.fetchUserStats(username)
      .then(res => {
        this.fetchingData = false;
        this.fetchSuccess = true;
        this.user = res.data.user;
        this.stats = res.data.stats.filter(s => s.currency !== null);
      })
      .catch(error => {
        this.fetchingData = false;
        this.fetchSuccess = false;
        if (error.response) {
          this.buildErrors(error.response);
          return;
        }

        throw error;
      });
    },
    buildErrors (response) {
      if (response && response.status === 400) {
        if (response.data.errors) {
          const newErrors = {};

          response.data.errors.forEach(error => {
            newErrors[error.param] = newErrors[error.param]
              ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
          });

          this.errors = newErrors;
          return;
        }

        if (response.data.error) {
          this.errors = {
            global: response.data.error
          };
        }
      }
    },
    formatDate (date) {
      return moment(date).format('LL');
    },
    banUser () {
      this.$store.dispatch('banUserFromChat', this.user.username);
    },
    unBanUser () {
      this.$store.dispatch('unBanUserFromChat', this.user.username);
    },
    clearUsersChat () {
      this.$store.dispatch('clearUsersChat', this.user.username);
    },
    isUserBanned (username) {
      return this.bannedUsernames.indexOf(username) > -1;
    }
  }
};
</script>
<style lang="scss">
  #userLookupModal {
    .invalid-feedback {
      text-align: center;
    }
    .user-details {
      &__title {
        font-size: 16px;
        margin: 5px auto;
      }
      &__date {
        font-size: 14px;
        padding-bottom: 20px;
      }
      &__currency {
        margin: auto;
      }
      &__stat {
        padding-bottom: 10px;
        &__value {
          font-size: 16px;
          font-weight: bold;
        }
        &__key {
          font-size: 12px;
        }
      }
    }
  }
</style>
