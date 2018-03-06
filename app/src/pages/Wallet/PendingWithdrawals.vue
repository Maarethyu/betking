<template>
  <div>
    <b-table
      stacked="sm"
      head-variant="dark"
      :per-page="perPage"
      :current-page="currentPage"
      :items="fetchPendingWithdrawals"
      :fields="fields"
      :show-empty="true"
      ref="table"
      empty-text="You don't have any pending withdrawals"
      responsive small outlined hover>

      <template slot="HEAD_show_details" slot-scope="data">
        <i class="fa fa-plus"></i>
      </template>

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

    <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" align="center" />
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
  import bus from 'src/bus';

  export default {
    name: 'PendingWithdrawals',
    components: {
      'b-table': bTable,
      'b-pagination': bPagination,
      'b-button': bButton,
      'b-row': bRow,
      'b-col': bCol
    },
    mounted () {
      bus.$on('WITHDRAWAL_REQUESTED', () => {
        this.$refs.table.refresh();
      });
    },
    data: () => ({
      perPage: 10,
      currentPage: 1,
      totalRows: 0,
      isBusy: false,
      fields: [
        'show_details',
        {key: 'created_at', label: 'DATE', formatter: 'formatDate'},
        {key: 'currency', label: 'CURRENCY', formatter: 'showCurrencySymbol'},
        {key: 'amount', label: 'AMOUNT', formatter: 'formatAmount'},
        {key: 'status', label: 'STATUS'}
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
      fetchPendingWithdrawals (ctx) {
        const offset = (ctx.currentPage - 1) * ctx.perPage;

        return api.fetchPendingWithdrawals(ctx.perPage, offset, 'created_at')
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
