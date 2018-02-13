<template>
  <b-row>
    <b-col cols="12" md="8" offset-md="2">
      <b-table
        id="site-stats"
        responsive hover outlined
        :items="siteStats"
        :fields="fields">
        <template slot="currency" slot-scope="data">
          <CurrencyIcon :id="data.item.currency" :width="15" />
        </template>
      </b-table>
    </b-col>
  </b-row>
</template>

<script>
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import CurrencyIcon from 'components/CurrencyIcon';
  import {addCommas, formatBigAmount} from 'src/helpers';

  import {mapGetters} from 'vuex';

  export default {
    name: 'Stats',
    components: {
      'b-table': bTable,
      'b-row': bRow,
      'b-col': bCol,
      CurrencyIcon
    },
    data: () => ({
      fields: [
        {key: 'currency', class: 'text-center'},
        {key: 'numBets', class: 'text-center'},
        {key: 'wagered', formatter: 'formatAmount', class: 'text-right'},
        {key: 'profit', formatter: 'formatAmount', class: 'text-right'}
      ]
    }),
    computed: mapGetters({
      siteStats: 'siteStats',
      currencies: 'currencies'
    }),
    mounted () {
      this.fetchStats();
    },
    methods: {
      formatBigAmount,
      formatAmount (value, key, item) {
        return addCommas(this.formatBigAmount(value, item.currency));
      },
      fetchStats () {
        this.$store.dispatch('fetchStats');
      }
    }
  };
</script>
