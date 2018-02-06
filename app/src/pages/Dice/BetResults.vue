<template>
  <b-table class="dice-bet-results" responsive striped small outlined hover fixed :items="results" :fields="fields">
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

  import {mapGetters} from 'vuex';
  import {formatBigAmount} from 'src/helpers';

  export default {
    name: 'DiceBetResults',
    components: {
      'b-table': bTable,
      CurrencyIcon
    },
    computed: mapGetters({
      currencies: 'currencies'
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
        key: 'amount',
        label: 'Bet',
        formatter: 'formatAmount',
        class: 'text-right'
      }, {
        key: 'currency',
        label: 'Currency',
        class: 'text-left'
      }, {
        key: 'payout',
        label: 'Payout',
        formatter: 'formatPayout',
        class: 'text-right'
      }, {
        key: 'target',
        label: 'Target',
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
      }],
      results: [
        {id: '876692962', date: '2018-02-04T21:17:17.814Z', amount: '1000000', payout: 2, roll: 34.444, target: '< 49.5', profit: '1000000', currency: 0},
        {id: '876692962', date: '2018-02-04T21:17:17.814Z', amount: '20000', payout: 2, roll: 34.444, target: '< 49.5', profit: '-20000', currency: 0}
      ]
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
      formatPayout (value) {
        return `${value}x`;
      },
      formatTime (value) {
        return moment(value).format('mm:ss');
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
