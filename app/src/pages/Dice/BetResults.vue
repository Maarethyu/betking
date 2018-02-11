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

  .dice-bet-results th{
    text-align:center!important;
  }

</style>


<script>
  import bTable from 'bootstrap-vue/es/components/table/table';

  import CurrencyIcon from 'components/CurrencyIcon';
  import moment from 'moment';
  import BigNumber from 'bignumber.js';

  import {mapGetters} from 'vuex';
  import {formatBigAmount} from 'src/helpers';

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
        class: 'text-center'
      }, {
        key: 'date',
        label: 'Time',
        formatter: 'formatTime',
        class: 'text-center'
      }, {
        key: 'bet_amount',
        label: 'Bet Amount',
        formatter: 'formatAmount',
        class: 'text-right'
      }, {
        key: 'chance',
        label: 'Payout',
        formatter: 'gameDetailsToPayout',
        class: 'text-center'
      }, {
        key: 'target',
        label: 'Target',
        formatter: 'gameDetailsToTarget',
        class: 'text-center'
      }, {
        key: 'roll',
        label: 'Roll',
        formatter: 'gameDetailsToRoll',
        class: 'text-center'
      }, {
        key: 'profit',
        label: 'Profit',
        formatter: 'formatProfit',
        class: 'text-right'
      }, {
        key: 'currency',
        label: 'Currency',
        class: 'text-center'
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
      gameDetailsToPayout (value, key, item) {
        const payoutFixed = new BigNumber(99)
          .dividedBy(item.game_details.chance)
          .toFixed(4, BigNumber.ROUND_DOWN);

        const payout = new BigNumber(payoutFixed).toString();

        return `${payout}x`;
      },
      formatTime (value) {
        return moment(value).format('mm:ss');
      },
      gameDetailsToTarget (value, key, item) {
        const sign = item.game_details.target === 0 ? '<' : '>';
        const chance = new BigNumber(item.game_details.chance).toFixed(4, BigNumber.ROUND_DOWN);

        return `${sign} ${chance}`;
      },
      gameDetailsToRoll (value, key, item) {
        return item.game_details.roll;
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
