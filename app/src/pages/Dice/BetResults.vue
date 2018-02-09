<template>
  <b-table id="dice-bet-results" class="dice-bet-results" responsive striped small outlined hover fixed :items="latestBets" :fields="fields">
    <template slot="currency" slot-scope="data">
      <CurrencyIcon :value="data.value" :width="15" />
    </template>
  </b-table>
</template>

<style lang="scss">
  .dice-bet-results {
    // width: 60%;
    margin: 0 auto;
  }
</style>


<script>
  import bTable from 'bootstrap-vue/es/components/table/table';

  import CurrencyIcon from 'components/CurrencyIcon';
  import moment from 'moment';
  import BigNumber from 'bignumber.js';

  import {mapGetters} from 'vuex';
  import {formatBigAmount} from 'src/helpers';

  BigNumber.config({DECIMAL_PLACES: 4, ROUNDING_MODE: BigNumber.ROUND_DOWN});

  export default {
    name: 'DiceBetResults',
    components: {
      'b-table': bTable,
      CurrencyIcon
    },
    computed: mapGetters({
      currencies: 'currencies',
      latestBets: 'diceLatestBets'
    }),
    data: () => ({
      fields: [{
        key: 'id',
        label: 'Bet Id',
        class: 'text-left'
      }, {
        key: 'date',
        label: 'Time',
        formatter: 'formatTime',
        class: 'text-left'
      }, {
        key: 'bet_amount',
        label: 'Bet',
        formatter: 'formatAmount',
        class: 'text-right'
      }, {
        key: 'currency',
        label: 'Currency',
        class: 'text-left'
      }, {
        key: 'chance',
        label: 'Payout',
        formatter: 'chanceToPayout',
        class: 'text-right'
      }, {
        key: 'target',
        label: 'Target',
        formatter: 'formatTarget',
        class: 'text-left'
      }, {
        key: 'roll',
        label: 'Roll',
        class: 'text-right'
      }, {
        key: 'profit',
        label: 'Profit',
        formatter: 'formatProfit',
        class: 'text-right'
      }]
    }),
    methods: {
      formatBigAmount,
      formatAmount (value, key, item) {
        return this.darkenZero(this.formatBigAmount(value, item.currency));
      },
      formatProfit (value, key, item) {
        const amount = this.formatAmount(value, key, item);
        const className = value > 0 ? 'text-green' : 'text-red';

        return `<span class="${className}">${amount}</span>`;
      },
      chanceToPayout (chance) {
        const payout = new BigNumber(99)
          .dividedBy(chance)
          .toString();

        return `${payout}x`;
      },
      formatTime (value) {
        return moment(value).format('mm:ss');
      },
      formatTarget (target, key, item) {
        const sign = target === 0 ? '<' : '>';

        return `${sign} ${item.chance}`;
      },
      darkenZero (x) {
        const parts = x.split('.');
        let newX = x;
        let decimalPart = '';

        if (parts.length === 2) {
          decimalPart = parts[1].replace(/(0+)$/, '<span class="darken">$1</span>');
          newX = decimalPart.length > 0 ? `${parts[0]}.${decimalPart}` : parts[0];
        }

        return newX;
      }
    }
  };
</script>
