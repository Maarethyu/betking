<template>
  <div>
    <b-table
      id="wallet-withdrawal-history"
      stacked="sm"
      :per-page="perPage"
      :current-page="currentPage"
      :items="fetchWithdrawalHistory"
      :fields="fields"
      :show-empty="true"
      :no-provider-sorting="true"
      empty-text="You don't have any confirmed withdrawals"
      responsive striped small outlined hover>

      <template slot="show_details" slot-scope="row">
        <b-button size="sm" variant="default" @click.stop="row.toggleDetails">
          {{ row.detailsShowing ? '-' : '+'}}
        </b-button>
      </template>

      <template slot="row-details" slot-scope="row">
        <b-row :no-gutters="true">
          <b-col cols="12" md="2">Address:</b-col>
          <b-col cols="12" md="10">{{ row.item.address }}</b-col>
        </b-row>
      </template>
    </b-table>
    <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" align="right" />
  </div>
</template>

<script>
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bPagination from 'bootstrap-vue/es/components/pagination/pagination';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import {mapGetters} from 'vuex';
  import moment from 'moment';
  import {addCommas, formatBigAmount, formatCurrency} from 'src/helpers';
  import api from 'src/api';

  export default {
    name: 'PendingWithdrawals',
    components: {
      'b-table': bTable,
      'b-pagination': bPagination,
      'b-button': bButton,
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      perPage: 10,
      currentPage: 1,
      totalRows: 0,
      isBusy: false,
      fields: [
        {key: 'show_details', label: '+'},
        {key: 'created_at', label: 'Date', formatter: 'formatDate'},
        {key: 'currency', label: 'Currency', formatter: 'showCurrencySymbol'},
        {key: 'amount', label: 'Amount', formatter: 'formatAmount'},
        {key: 'status', label: 'Status'}
      ]
    }),
    computed: mapGetters({
      currencies: 'currencies',
    }),
    methods: {
      formatBigAmount,
      addCommas,
      formatCurrency,
      showCurrencySymbol (value, key, item) {
        return this.formatCurrency(value, item.sym);
      },
      formatAmount (value, key, item) {
        return this.addCommas(this.formatBigAmount(value, item.currency));
      },
      formatDate (ts) {
        return moment(ts).format('LLL');
      },
      fetchWithdrawalHistory (ctx) {
        const offset = (ctx.currentPage - 1) * ctx.perPage;

        return api.fetchWithdrawalHistory(ctx.perPage, offset, 'created_at')
          .then(res => {
            if (res && res.data && Array.isArray(res.data.results)) {
              this.totalRows = parseInt(res.data.count, 10);
              return res.data.results;
            }
          })
          .catch(error => {
            console.error(error);
            return [];
          });
      }
    }
  };
</script>
