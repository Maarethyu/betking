<template>
  <b-modal id="betDetailsModal" ref="modal" lazy @hide="onModalHide" @shown="onModalShow">
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">
      <div>Bet Lookup</div>
    </template>
    <template v-if="!isSearch">
      <div class="alert alert-danger" v-if="errors.global">{{errors.global}}</div>
      <div class="alert alert-danger" v-if="errors.id">{{errors.id}}</div>
    </template>
    <template v-if="isSearch">
      <b-form-group :invalid-feedback="betNotFoundMessage" :state="fetchSuccess">
        <b-input-group prepend="Bet Id">
          <b-form-input id="betId"
                        type="number"
                        placeholder="Enter the Bet Id"
                        v-model="searchId"
                        @keyup.native.enter="fetchBetDetails(searchId)">
          </b-form-input>
          <b-input-group-append>
            <b-btn size="sm" class="btn btn-primary" variant="primary" @click.prevent="fetchBetDetails(searchId)">
              <i class="fa fa-search"></i> Search</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
    </template>
    <b-container fluid>
      <template v-if="fetchingData">
        <b-row class="pbm text-center">
          <b-col>Fetching Bet Details.</b-col>
        </b-row>
      </template>
      <template v-if="fetchSuccess">
        <b-row>
          <b-col cols="" class="bet-results__title text-center">BET: {{betDetail.betId}}</b-col>
        </b-row>
        <b-row>
          <b-col cols="" class="bet-results__date text-center" v-if="betDetail.date">{{formatDate(betDetail.date)}}</b-col>
        </b-row>
        <b-row class="bet-results__stat text-center">
          <b-col cols="4">
            <div class="bet-results__stat__key">USER</div>
            <span class="bet-results__stat__value">{{betDetail.userName}}</span>
          </b-col>
          <b-col cols="4">
            <div class="bet-results__stat__key">BET AMOUNT</div>
            <span class="bet-results__stat__value">{{formatBigAmount(betDetail.betAmount, betDetail.currency)}}</span>
            <CurrencyIcon :id="betDetail.currency" :width="20" />
          </b-col>
          <b-col cols="4">
            <div class="bet-results__stat__key">PROFIT</div>
            <span class="bet-results__stat__value" v-html="formatProfit(betDetail.profit, betDetail.currency)"></span>
            <CurrencyIcon :id="betDetail.currency" :width="20" />
          </b-col>
        </b-row>
        <b-row class="bet-results__stat text-center">
          <b-col cols="4">
            <div class="bet-results__stat__key">PAYOUT</div>
            <span class="bet-results__stat__value">{{gameDetailsToPayout(betDetail.gameDetails)}}</span>
          </b-col>
          <b-col cols="4">
            <div class="bet-results__stat__key">Target</div>
            <span class="bet-results__stat__value">{{gameDetailsToTarget(betDetail.gameDetails)}}</span>
          </b-col>
          <b-col cols="4">
            <div class="bet-results__stat__key">ROLL</div>
            <span class="bet-results__stat__value">{{gameDetailsToRoll(betDetail.gameDetails)}}</span>
          </b-col>
        </b-row>
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
import {formatBigAmount, gameDetailsToTarget, gameDetailsToRoll, gameDetailsToPayout} from 'src/helpers';
import CurrencyIcon from 'components/CurrencyIcon';
import bus from 'src/bus';

export default {
  name: 'BetDetailsModal',
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
      currencies: 'currencies'
    }),
  },
  data: () => ({
    errors: {},
    betDetail: null,
    searchId: '',
    fetchSuccess: null,
    fetchingData: false,
    betNotFoundMessage: 'Sorry, we could not fetch data for this bet.',
    isSearch: false
  }),
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  methods: {
    formatBigAmount,
    gameDetailsToPayout,
    gameDetailsToRoll,
    gameDetailsToTarget,
    onModalShow () {
      if (this.id) {
        this.isSearch = false;
        this.fetchBetDetails(this.id);
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
      this.betDetail = null;
      this.searchId = '';
      this.fetchingData = false;
      this.fetchSuccess = null;
    },
    fetchBetDetails (id) {
      if (!id) return;
      this.fetchingData = true;
      api.fetchBetDetails(id)
      .then(res => {
        this.fetchingData = false;
        this.fetchSuccess = true;
        this.betDetail = res.data;
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
      return moment(date).format('LLL');
    }
  }
};
</script>
<style lang="scss">
  #betDetailsModal {
    .invalid-feedback {
      text-align: center;
    }
    .bet-results {
      &__title {
        font-size: 20px;
        margin: 5px auto;
      }
      &__date {
        font-size: 14px;
        padding-bottom: 20px;
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
