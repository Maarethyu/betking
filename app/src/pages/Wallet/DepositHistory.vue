<template>
  <div>
    <b-table
      id="wallet-deposit-history"
      stacked="sm"
      ref="table"
      head-variant="dark"
      :per-page="perPage"
      :items="renderData"
      :fields="fields"
      :show-empty="true"
      :no-provider-sorting="true"
      empty-text="You haven't made any deposits"
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

          <b-col cols="12" md="2">Tx id:</b-col>
          <b-col cols="12" md="10">{{ row.item.txid }}</b-col>
        </b-row>
      </template>
    </b-table>
    <b-pagination :total-rows="totalRows" :per-page="perPage" align="center" @change="fetchDepositHistory" />
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
    name: 'DepositHistory',
    components: {
      'b-table': bTable,
      'b-pagination': bPagination,
      'b-button': bButton,
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      totalRows: 0,
      isBusy: false,
      renderData: [],
      fields: [
        'show_details',
        {key: 'created_at', label: 'DATE', formatter: 'formatDate'},
        {key: 'currency', label: 'CURRENCY', formatter: 'showCurrencySymbol'},
        {key: 'amount', label: 'AMOUNT', formatter: 'formatAmount'}
      ]
    }),
    props: {
      data: {
        type: Object,
        required: true,
        default: () => ({})
      },
      perPage: {
        type: Number,
        default: 10
      }
    },
    watch: {
      data (dataFromProps) {
        if (!dataFromProps.results) return;
        this.totalRows = parseInt(dataFromProps.count, 10);
        this.renderData = dataFromProps.results;
      }
    },
    mounted () {
      bus.$on('DEPOSIT_CONFIRMED', () => {
        this.fetchDepositHistory(1);
      });
    },
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
      fetchDepositHistory (page) {
        const offset = (page - 1) * this.perPage;

        api.fetchDepositHistory(this.perPage, offset, 'created_at')
          .then(res => {
            if (res && res.data && Array.isArray(res.data.results)) {
              this.totalRows = parseInt(res.data.count, 10);
              this.renderData = res.data.results;
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
