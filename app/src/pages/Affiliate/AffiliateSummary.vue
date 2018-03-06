<template>
  <div>
    <b-table
      stacked="sm"
      :items="summary"
      :fields="fields"
      :show-empty="true"
      ref="table"
      empty-text="No earnings made from affiliate so far"
      responsive striped small outlined hover>
    </b-table>
  </div>
</template>

<script>
  import bTable from 'bootstrap-vue/es/components/table/table';

  import {mapGetters} from 'vuex';
  import {addCommas, formatBigAmount, formatCurrency} from 'src/helpers';

  export default {
    name: 'AffiliateSummary',
    components: {
      'b-table': bTable
    },
    data: () => ({
      totalRows: 0,
      fields: [
        {key: 'currency', label: 'Currency', formatter: 'showCurrencySymbol'},
        {key: 'total_claimed', label: 'Total Earnings', formatter: 'formatAmount'},
        {key: 'amount_due', label: 'Amount Due', formatter: 'formatAmount'}
      ]
    }),
    props: {
      data: {
        type: Array,
        required: true,
        default: []
      }
    },
    computed: {
      ...mapGetters({
        currencies: 'currencies',
      }),
      summary () {
        return this.data.map(item => {
          let currency = item.payment_currency;

          if (item.payment_currency === null) {
            currency = item.payments_due_currency;
          }

          return {...item, currency};
        });
      }
    },
    methods: {
      formatBigAmount,
      addCommas,
      formatCurrency,
      showCurrencySymbol (value, key, item) {
        return this.formatCurrency(value, item.sym);
      },
      formatAmount (value, key, item) {
        if (value === null) {
          return 0;
        }
        return this.addCommas(this.formatBigAmount(value, item.currency));
      }
    }
  };
</script>
