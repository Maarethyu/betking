<template>
  <b-modal size="lg" id="dice-auto-bet" ref="modal" hide-footer lazy @shown="onModalShown">
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Automated Betting</template>

    <b-row>
      <b-col cols="6">
        <b-form-group label="Base Bet Amount" label-for="dice-betamount-auto">
          <b-input-group :class="{invalid: !betAmountValid}">
            <input class="form-control" id="dice-betamount-auto" v-model="betAmount" @keyup="validateBetAmount" type="text"
              autocomplete="off" />
            <template slot="append">
              <CurrencyIcon :id="activeCurrency" :width="20" />
            </template>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col cols="6">
        <b-form-group label="No of rolls" label-for="dice-no-of-rolls">
          <b-input-group :class="{invalid: !noOfRollsValid}">
            <input class="form-control" id="dice-no-of-rolls" v-model="noOfRolls" @keyup="validateNoOfRolls" type="text"
              autocomplete="off" />
            <template slot="append">
              {{ parseInt(noOfRolls, 10) === 0 ? 'No limit' : '#' }}
            </template>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="6">
        <b-form-group label="Chance" label-for="dice-chance-auto">
          <b-input-group :class="{invalid: !isChanceValid}">
            <input class="form-control" id="dice-chance-auto" v-model="chance" @keyup="updateChance" type="text"
              @blur="onBlurChance" autocomplete="off" />
            <template slot="append"><i class="fa fa-percent" /></template>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col cols="6">
        <b-form-group label="Payout" label-for="dice-payout-auto">
          <b-input-group :class="{invalid: !isPayoutValid}">
            <input class="form-control" id="dice-payout-auto" v-model="payout" @keyup="updatePayout" type="text"
               @blur="onBlurPayout" autocomplete="off" />
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

    <b-row class="dice__bet-controls__bet-buttons" id="dice-bet-buttons-auto">
      <b-col sm="3" offset-sm="3" cols="6">
        <b-button class="pull-right" :variant="target === 1 ? 'danger' : 'grey'" @click="selectTarget(1)">
          Hi<br>
          <small>&gt; {{ hiTarget }}</small>
        </b-button>
      </b-col>

      <b-col cols="3" sm="3">
        <b-button class="pull-left" :variant="target === 0 ? 'danger' : 'grey'" @click="selectTarget(0)">
          Lo<br>
          <small>&lt; {{ loTarget }}</small>
        </b-button>
      </b-col>

      <b-col cols="12">
        <br />
        <b-alert variant="danger" :show="!!errorMessage">
          {{errorMessage}}
        </b-alert>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="6">
        <b-form-group label="Stop if balance less than" label-for="dice-stop-if-balance-less-than">
          <b-input-group :class="{invalid: !stopIfBalanceLessThanValid}">
            <input class="form-control" id="dice-stop-if-balance-less-than" v-model="stopIfBalanceLessThan" @keyup="validateStopIfBalanceLessThan" type="text"
              autocomplete="off" />
            <template slot="append">
              <CurrencyIcon :id="activeCurrency" :width="20" />
            </template>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col cols="6">
        <b-form-group label="Stop if balance greater than" label-for="dice-stop-if-balance-greater-than">
          <b-input-group :class="{invalid: !stopIfBalanceGreaterThanValid}">
            <input class="form-control" id="dice-stop-if-balance-greater-than" v-model="stopIfBalanceGreaterThan" @keyup="validateStopIfBalanceGreaterThan" type="text"
              autocomplete="off" />
            <template slot="append">
              <CurrencyIcon :id="activeCurrency" :width="20" />
            </template>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="6">
        <b-form-group label="On win" label-for="dice-on-win">
          <b-row class="increase-reset-buttons">
            <b-col cols="12" md="6">
              <b-button :variant="onWinResetToBase ? 'primary' : 'default'" class="b-tr-n b-br-n b-bl-n" type="button" @click="clickOnWinResetToBase">Reset to base</b-button>
            </b-col>
            <b-col cols="12" md="6">
              <b-button :variant="!onWinResetToBase ? 'primary' : 'default'" class="b-tl-n b-br-n b-bl-n" type="button" @click="onWinResetToBase = false">Increase by</b-button>
            </b-col>
          </b-row>
          <b-input-group v-if="!onWinResetToBase" :class="{invalid: !onWinIncreaseByValid}">
            <input class="form-control" id="dice-on-win" v-model="onWinIncreaseBy" @keyup="validateOnWinIncreaseBy" type="text"
              autocomplete="off" :disabled="onWinResetToBase" />
            <template slot="append"><i class="fa fa-close" /></template>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col cols="6">
        <b-form-group label="On loss" label-for="dice-on-win">
          <b-row class="increase-reset-buttons">
            <b-col cols="12" md="6">
              <b-button :variant="onLossResetToBase ? 'primary' : 'default'" class="b-tr-n b-br-n b-bl-n" type="button" @click="clickOnLossResetToBase">Reset to base</b-button>
            </b-col>
            <b-col cols="12" md="6">
              <b-button :variant="!onLossResetToBase ? 'primary' : 'default'" class="b-tl-n b-br-n b-bl-n" type="button" @click="onLossResetToBase = false">Increase by</b-button>
            </b-col>
          </b-row>
          <b-input-group v-if="!onLossResetToBase" :class="{invalid: !onLossIncreaseByValid}">
            <input class="form-control" id="dice-on-win" v-model="onLossIncreaseBy" @keyup="validateOnLossIncreaseBy" type="text"
              autocomplete="off" :disabled="onLossResetToBase" />
            <template slot="append"><i class="fa fa-close" /></template>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="12" id="bet-amount-controls">
        <b-button size="sm" variant="primary" @click="halvedBetAmount">1/2</b-button>
        <b-button size="sm" variant="primary" @click="doubleBetAmount">x2</b-button>
        <b-button size="sm" variant="primary" @click="setMinBetAmount">min</b-button>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="12">
        <b-button variant="default" class="pull-left" @click="resetDefaultValues">Reset</b-button>
        <b-button variant="primary" class="pull-right" :disabled="!areInputsValid" @click="startAutoBet">Start</b-button>
        <b-button variant="default" class="pull-right mr-2" @click="closeModal">Close</b-button>
      </b-col>
    </b-row>

  </b-modal>
</template>

<style lang="scss">
  $bet-controls-bg: rgba(0,0,0,.98);

  #dice-auto-bet {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    .modal-header {
      background-color: $bet-controls-bg;
    }

    .modal-content {
      background-color: $bet-controls-bg;
      color: #fff;
    }

    .increase-reset-buttons {
      &.row {
        margin: 0;
      }
      .col-md-6, .col-12 {
        padding: 0;
      }
      button {
        width: 100%;
      }
    }
    .b-tl-n {
    border-top-left-radius: 0;
    }
    .b-tr-n {
      border-top-right-radius: 0;
    }
    .b-bl-n {
      border-bottom-left-radius: 0;
    }
    .b-br-n {
      border-bottom-right-radius: 0;
    }
  }
</style>


<script>
  import bModal from 'components/modal/modal';
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
  import BigNumber from 'bignumber.js';

  import {
    updateTargets,
    updateChance,
    updatePayout,
    onBlurChance,
    onBlurPayout,
    updateProfit,
    updateBetAmount,
    halvedBetAmount,
    doubleBetAmount,
    setMinBetAmount
  } from './bet-controls';

  export default {
    name: 'AutoBetModal',
    components: {
      'b-modal': bModal,
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
    data: () => ({
      chance: 49.5,
      betAmount: 0,
      betProfit: 0,
      payout: 2,
      hiTarget: '50.4999',
      loTarget: '49.5000',
      isPayoutValid: true,
      isChanceValid: true,
      showPayoutWarning: false,
      noOfRolls: 0,
      noOfRollsValid: true,
      timerId: null,
      stopIfBalanceGreaterThan: '',
      stopIfBalanceGreaterThanValid: true,
      stopIfBalanceLessThan: '',
      stopIfBalanceLessThanValid: true,
      onWinResetToBase: true,
      onLossResetToBase: true,
      onWinIncreaseBy: '',
      onWinIncreaseByValid: true,
      onLossIncreaseBy: '',
      onLossIncreaseByValid: true,
      betAmountValid: true,
      target: null,
      errorMessage: ''
    }),
    computed: {
      ...mapGetters({
        balance: 'activeCurrencyBalance',
        activeCurrency: 'activeCurrency',
        maxWin: 'diceMaxWin',
        autoBetSettings: 'diceAutoBetSettings',
        minBetAmount: 'diceMinBetAmount',
        currencies: 'currencies'
      }),
      areInputsValid () {
        return this.betAmountValid && this.noOfRollsValid && this.isChanceValid && this.isPayoutValid &&
          this.stopIfBalanceLessThanValid && this.stopIfBalanceGreaterThanValid && this.onWinIncreaseByValid &&
          this.onLossIncreaseByValid;
      },
      currency () {
        return this.currencies.find(c => c.id === this.activeCurrency);
      }
    },
    methods: {
      updateTargets,
      updateChance,
      updatePayout,
      onBlurChance,
      onBlurPayout,
      updateProfit,
      updateBetAmount,
      halvedBetAmount,
      doubleBetAmount,
      setMinBetAmount,
      onModalShown () {
        this.initializeSettingsFromStore();
        this.betAmount = new BigNumber(this.minBetAmount).toFixed(this.currency.scale);
      },
      closeModal () {
        this.$refs.modal.hide();
      },
      countDownChanged (dismissCountDown) {
        this.showPayoutWarning = dismissCountDown;
      },
      validateOnLossIncreaseBy () {
        let onLossIncreaseBy;
        try {
          onLossIncreaseBy = new BigNumber(this.onLossIncreaseBy);
        } catch (e) {
          onLossIncreaseBy = new BigNumber(NaN);
        }

        this.onLossIncreaseByValid = this.onLossIncreaseBy === '' || (
            !this.onLossResetToBase &&
            !onLossIncreaseBy.isNaN() &&
            onLossIncreaseBy.gt(0)
          );
      },
      validateOnWinIncreaseBy () {
        let onWinIncreaseBy;
        try {
          onWinIncreaseBy = new BigNumber(this.onWinIncreaseBy);
        } catch (e) {
          onWinIncreaseBy = new BigNumber(NaN);
        }

        this.onWinIncreaseByValid = this.onWinIncreaseBy === '' || (
            !this.onWinResetToBase &&
            !onWinIncreaseBy.isNaN() &&
            onWinIncreaseBy.gt(0)
          );
      },
      validateStopIfBalanceGreaterThan () {
        let stopIfBalanceGreaterThan;
        try {
          stopIfBalanceGreaterThan = new BigNumber(this.stopIfBalanceGreaterThan);
        } catch (e) {
          stopIfBalanceGreaterThan = new BigNumber(NaN);
        }

        this.stopIfBalanceGreaterThanValid = this.stopIfBalanceGreaterThan === '' || (
            !stopIfBalanceGreaterThan.isNaN() &&
            stopIfBalanceGreaterThan.gt(0)
          );
      },
      validateStopIfBalanceLessThan () {
        let stopIfBalanceLessThan;
        try {
          stopIfBalanceLessThan = new BigNumber(this.stopIfBalanceLessThan);
        } catch (e) {
          stopIfBalanceLessThan = new BigNumber(NaN);
        }

        this.stopIfBalanceLessThanValid = this.stopIfBalanceLessThan === '' || (
            !stopIfBalanceLessThan.isNaN() &&
            stopIfBalanceLessThan.gt(0)
          );
      },
      validateBetAmount () {
        let betAmount;
        try {
          betAmount = new BigNumber(this.betAmount);
        } catch (e) {
          betAmount = new BigNumber(NaN);
        }

        this.betAmountValid = !betAmount.isNaN() && betAmount.gte(this.minBetAmount);
      },
      validateNoOfRolls () {
        let noOfRolls;
        try {
          noOfRolls = new BigNumber(this.noOfRolls);
        } catch (e) {
          noOfRolls = new BigNumber(NaN);
        }

        this.noOfRollsValid = !noOfRolls.isNaN() && noOfRolls.gte(0);
      },
      clickOnLossResetToBase () {
        this.onLossIncreaseBy = '';
        this.onLossResetToBase = true;
        this.onLossIncreaseByValid = true;
      },
      clickOnWinResetToBase () {
        this.onWinIncreaseBy = '';
        this.onWinResetToBase = true;
        this.onWinIncreaseByValid = true;
      },
      selectTarget (target) {
        this.target = target;
        this.errorMessage = '';
      },
      startAutoBet () {
        if (this.target !== 0 && this.target !== 1) {
          this.errorMessage = 'Please select hi or lo';
          return;
        }

        const autoBetSettings = {
          betAmount: this.betAmount,
          noOfRolls: this.noOfRolls,
          chance: this.chance,
          target: this.target,
          stopIfBalanceGreaterThan: this.stopIfBalanceGreaterThan,
          stopIfBalanceLessThan: this.stopIfBalanceLessThan,
          onWinResetToBase: this.onWinResetToBase,
          onLossResetToBase: this.onLossResetToBase,
          onLossIncreaseBy: this.onLossIncreaseBy,
          onWinIncreaseBy: this.onWinIncreaseBy
        };
        this.$store.dispatch('setAutoBetSettings', autoBetSettings);
        this.$store.dispatch('startAutoBet');
        this.closeModal();
      },
      initializeSettingsFromStore () {
        Object.keys(this.autoBetSettings).forEach(key => {
          if (this.autoBetSettings.hasOwnProperty(key)) {
            this[key] = this.autoBetSettings[key];
          }
        });
        this.updateChance();
      },
      resetDefaultValues () {
        this.betAmount = new BigNumber(this.minBetAmount).toFixed(this.currency.scale);
        this.noOfRolls = 0;
        this.chance = 49.5;
        this.target = null;
        this.stopIfBalanceGreaterThan = '';
        this.stopIfBalanceLessThan = '';
        this.onWinResetToBase = true;
        this.onLossResetToBase = true;
        this.onWinIncreaseBy = '';
        this.onLossIncreaseBy = '';

        this.updateChance();
        this.validateBetAmount();
        this.validateNoOfRolls();
        this.validateOnLossIncreaseBy();
        this.validateOnWinIncreaseBy();
        this.validateStopIfBalanceLessThan();
        this.validateStopIfBalanceGreaterThan();
      }
    }
  };
</script>
