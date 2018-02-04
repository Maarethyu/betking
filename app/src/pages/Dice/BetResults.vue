<template>
  <b-table responsive striped small outlined hover :items="results" :fields="fields">
    <template slot="currency" slot-scope="data">
      <CurrencyIcon :value="data.value" :width="15" />
    </template>
  </b-table>
</template>

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
        label: 'Bet Id'
      }, {
        key: 'date',
        label: 'Time',
        formatter: (value) => moment(value).format('LLL')
      }, {
        key: 'amount',
        label: 'Bet'
      }, {
        key: 'currency',
        label: 'Currency'
      }, {
        key: 'payout',
        label: 'Payout',
        formatter: (value) => `${value}x`
      }, {
        key: 'target',
        label: 'Target'
      }, {
        key: 'roll',
        label: 'Roll'
      }, {
        key: 'profit',
        label: 'Profit',
        // formatter: (value, key, item) => this.formatBigAmount(value, item.currency)
      }],
      results: [
        {id: '876692962', date: '2018-02-04T21:17:17.814Z', amount: '0.001', payout: 2, roll: 34.444, target: '< 49.5', profit: '0.001', currency: 0},
        {id: '876692962', date: '2018-02-04T21:17:17.814Z', amount: '0.001', payout: 2, roll: 34.444, target: '< 49.5', profit: '0.001', currency: 0}
      ]
    }),
    methods: {
      formatBigAmount
    }
  };
</script>
