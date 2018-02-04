<template>
<div class="dice animated fadeIn">
  <div class="dice__bet-controls">
    <b-row>

      <b-col cols="6">
        <b-form-group id="dice-fg-betamount" label="Bet Amount" label-for="dice-betamount">
          <b-input-group>
            <input class="form-control" id="dice-betamount" v-model="betAmount" @keyup="updateProfit" type="text"
              autocomplete="off" />
            <template slot="append">
              <CurrencyIcon :value="activeCurrency" :width="20" />
            </template>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col cols="6">
        <b-form-group id="dice-fg-betprofit" label="Bet Profit" label-for="dice-betprofit">
          <b-input-group>
            <input class="form-control" id="dice-betprofit" v-model="betProfit" @keyup="updateBetAmount" type="text"
              autocomplete="off" />
            <template slot="append">
              <CurrencyIcon :value="activeCurrency" :width="20" />
            </template>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="6">
        <b-form-group id="dice-fg-chance" label="Chance" label-for="dice-chance">
          <b-input-group :class="{invalid: !isChanceValid}">
            <input class="form-control" id="dice-chance" v-model="chance" v-on:keyup="updateChance" @blur="onBlurChance"
              type="text" autocomplete="off" />
            <template slot="append"><i class="fa fa-percent" /></template>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col cols="6">
        <b-form-group id="dice-fg-payout" label="Payout" label-for="dice-payout">
          <b-input-group :class="{invalid: !isPayoutValid}">
            <input class="form-control" id="dice-payout" v-model="payout" v-on:keyup="updatePayout" @blur="onBlurPayout"
              type="text" autocomplete="off" />
            <template slot="append"><i class="fa fa-close" /></template>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col cols="12">
        <b-alert variant="danger" :show="!isPayoutValid || !isChanceValid">
          Chance must be greater than 0.0001 and less than 98.99.
        </b-alert>
      </b-col>

      <b-col cols="12">
        <b-alert variant="warning" :show="showPayoutWarning" max="3" @dismiss-count-down="countDownChanged">
          Exact payout multiplier cannot be found. The closest available multiplier will be selected if you stop typing for 3 seconds.
          <b-progress variant="warning" :max="3" :value="showPayoutWarning" height="4px" />
        </b-alert>
      </b-col>
    </b-row>

    <b-row class="dice__bet-controls__result">
      <b-col cols="8" offset="2">
        Roll 1010.11 <br>
        You won 20
        <CurrencyIcon :value="activeCurrency" />
      </b-col>
    </b-row>

    <b-row class="dice__bet-controls__bet-buttons">
      <b-col sm="3" offset-sm="3" cols="6">
        <b-button variant="danger" :disabled="bettingDisabled">
          Hi<br>
          <small>&gt; {{ hiTarget }}</small>
        </b-button>
      </b-col>

      <b-col cols="3" sm="3">
        <b-button variant="danger" :disabled="bettingDisabled">
          Lo<br>
          <small>&lt; {{ loTarget }}</small>
        </b-button>
      </b-col>

      <b-col cols="3">
        <b-button class='btm-sm btn-fair' variant="primary"><i class='fa fa-balance-scale'></i></b-button>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="12">
        <b-button class='btm-sm' variant="primary" @click="halvedBetAmount">1/2</b-button>
        <b-button class='btm-sm' variant="primary" @click="doubleBetAmount">x2</b-button>
        <b-button class='btm-sm' variant="primary" @click="minBetAmount">min</b-button>
        <b-button class='btm-sm' variant="primary" @click="maxBetAmount">max</b-button>
        <b-button class='btm-sm d-none d-sm-inline-block' variant="primary"><i class='fa fa-keyboard-o'></i></b-button>
        <b-button class='btm-sm' variant="primary" disabled>
          <span class='d-none d-sm-inline'>How to play</span>
          <span class='d-inline d-sm-none'><i class='fa fa-question-circle'></i></span>
          </b-button>
        <b-button class='btm-sm' variant="primary" disabled>Auto</b-button>
      </b-col>
    </b-row>
  </div>
</div>
</template>

<style lang="scss">
  $input-border-radius: 4px;
  $bet-controls-bg: rgba(0,0,0,.8);
  $error-color: #8c0000;
  $error-color-light: #f2dede;
  $error-color-dark: #a94442;

  .dice {
    &__bet-controls {
      width: 100%;
      max-width: 540px;
      // height: 360px;
      background-color: $bet-controls-bg;
      color: #fff;
      margin: 0 auto;
      text-align: center;
      position: relative;
      padding: 10px 25px;

      .form-control {
        border: 1px solid $bet-controls-bg;
        border-top-left-radius: $input-border-radius;
        border-bottom-left-radius: $input-border-radius;
        text-align: right;
      }

      .input-group {
        &.invalid {
          input {
            background-color: $error-color;
            color: $error-color-light;
            border-color: $error-color-dark;
          }
          .input-group-append {
            background-color: $error-color-light;
            color: $error-color-dark;
            border-color: $error-color-dark;
          }
        }

        &-append {
          min-width: 40px;
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          justify-content: center;
          border: 1px solid $bet-controls-bg;
          border-top-right-radius: $input-border-radius;
          border-bottom-right-radius: $input-border-radius;
          background-color: #f0f3f5;
          color: #3f3f40;
        }
    }

      &__result {
        margin-bottom: 1rem;
      }

      &__bet-buttons {
        margin-bottom: 1rem;
        button {
          max-width: 75px;
          width: 75px;
          padding: 6px;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }

</style>


<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bAlert from 'bootstrap-vue/es/components/alert/alert';
  import bProgress from 'bootstrap-vue/es/components/progress/progress';

  import CurrencyIcon from 'components/CurrencyIcon';
  import {mapGetters} from 'vuex';

  import {
    // bet,
    updateTargets,
    updateChance,
    updatePayout,
    onBlurChance,
    onBlurPayout,
    updateProfit,
    // showProvablyFairDialog,
    // hideProvablyFairDialog,
    updateBetAmount,
    halvedBetAmount,
    doubleBetAmount,
    minBetAmount,
    maxBetAmount,
    // maxBetAmountClicked,
    // activateShortcuts,
    // shortcutsButtonClass,
    // keyUp,
    // startAutoBetLoop,
    // autoBet,
    // onAutoBetResult
  } from './bet-controls';

  export default {
    name: 'DicePage',
    data: () => ({
      betAmount: 0,
      betProfit: 0,
      chance: 49.5,
      payout: 2,
      hiTarget: '50.4999',
      loTarget: '49.5000',
      isPayoutValid: true,
      isChanceValid: true,
      showPayoutWarning: 0,
      waitingOnBetResult: false,
      demoModeOn: false,
      maxWin: 10, // TODO: Get from computed / backend
      timerId: null
    }),
    components: {
      'b-container': bContainer,
      'b-row': bRow,
      'b-col': bCol,
      'b-form-group': bFormGroup,
      'b-input-group': bInputGroup,
      'b-form-input': bFormInput,
      'b-button': bButton,
      'b-alert': bAlert,
      'b-progress': bProgress,
      CurrencyIcon
    },
    computed: {
      ...mapGetters({
        currencies: 'currencies',
        activeCurrency: 'activeCurrency',
        balance: 'activeCurrencyBalance'
      }),
      currency () {
        return this.currencies.find(c => c.value === this.activeCurrency);
      },
      bettingDisabled () {
        return this.waitingOnBetResult || !this.isPayoutValid || !this.isChanceValid || this.demoModeOn;
      }
    },
    methods: {
      updateProfit,
      updateBetAmount,
      onBlurChance,
      onBlurPayout,
      updateChance,
      updatePayout,
      updateTargets,
      halvedBetAmount,
      doubleBetAmount,
      minBetAmount,
      maxBetAmount,
      countDownChanged (dismissCountDown) {
        this.showPayoutWarning = dismissCountDown;
      }
    }

  };
</script>
