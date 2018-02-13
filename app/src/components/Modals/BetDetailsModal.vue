<template>
  <b-modal id="betDetailsModal" ref="modal" lazy @hide="onModalHide">
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">
      <div class="bet-results__title">BET: {{id}}</div>
      <div class="bet-results__date" v-if="betResults.date">{{formatDate(betResults.date)}}</div>
    </template>

    <div class="alert alert-danger" v-if="errors.global">{{errors.global}}</div>
    <div class="alert alert-danger" v-if="errors.id">{{errors.id}}</div>
    <b-container fluid>
      <template v-if="loading">
        <b-row class="pbm text-center">
          <b-col>Fetching Bet Details.</b-col>
        </b-row>
      </template>
      <template v-else>
        <b-row class="bet-results__stat text-center">
          <b-col cols="4">
            <div class="bet-results__stat__key">USER</div>
            <span class="bet-results__stat__value">{{betResults.userName}}</span>
          </b-col>
          <b-col cols="4">
            <div class="bet-results__stat__key">BET AMOUNT</div>
            <span class="bet-results__stat__value">{{betResults.betAmount}}</span>
            <CurrencyIcon :id="betResults.currency" :width="20" />
          </b-col>
          <b-col cols="4">
            <div class="bet-results__stat__key">PROFIT</div>
            <span class="bet-results__stat__value" v-html="formatProfit(betResults.profit, betResults.currency)"></span>
            <CurrencyIcon :id="betResults.currency" :width="20" />
          </b-col>
        </b-row>
        <b-row class="bet-results__stat text-center">
          <b-col cols="4">
            <div class="bet-results__stat__key">PAYOUT</div>
            <span class="bet-results__stat__value">{{gameDetailsToPayout(betResults.gameDetails)}}</span>
          </b-col>
          <b-col cols="4">
            <div class="bet-results__stat__key">Target</div>
            <span class="bet-results__stat__value">{{gameDetailsToTarget(betResults.gameDetails)}}</span>
          </b-col>
          <b-col cols="4">
            <div class="bet-results__stat__key">ROLL</div>
            <span class="bet-results__stat__value">{{gameDetailsToRoll(betResults.gameDetails)}}</span>
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
    CurrencyIcon
  },
  directives: {
    'b-modal': vBModal
  },
  computed: {
    ...mapGetters({
      currencies: 'currencies'
    })
  },
  data: () => ({
    errors: {},
    betResults: {},
    loading: true
  }),
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  watch: {
    id (newValue) {
      if (newValue) {
        this.fetchBetDetails(newValue);
      }
    }
  },
  methods: {
    formatBigAmount,
    gameDetailsToPayout,
    gameDetailsToRoll,
    gameDetailsToTarget,
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
      this.betResults = {};
    },
    fetchBetDetails (id) {
      api.fetchBetDetails(id)
      .then(res => {
        this.loading = false;
        this.betResults = res.data;
      })
      .catch(error => {
        this.loading = false;
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
  .modal-header {
    height: 74px;
  }
  .bet-results {
    &__title {
      font-size: 20px;
      margin: 5px auto;
    }
    &__date {
      font-size: 14px;
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
</style>
