<template>
  <div>
    <b-table
      stacked="sm"
      :per-page="perPage"
      :items="renderData"
      :fields="fields"
      :show-empty="true"
      ref="table"
      empty-text="You don't have any affiliates registered yet"
      responsive striped small outlined hover>

      <template slot="show_details" slot-scope="row">
        <b-button size="sm" variant="default" @click.stop="fetchAmountDue(row)">
          {{ row.detailsShowing ? '-' : '+'}}
        </b-button>
      </template>

      <template slot="row-details" slot-scope="row">
        <template v-if="fetchingAmountDuePerUser[row.item.user_id]">
          <b-row :no-gutters="true">
            Fetching
          </b-row>
        </template>
        <template v-else>
          <b-row :no-gutters="true" v-for="item of amountDuePerUser[row.item.user_id]" :key="item.currency">
            <b-col cols="12" md="4">Currency: {{formatCurrency(item.currency)}}</b-col>
            <b-col cols="12" md="6">Amount: {{addCommas(formatBigAmount(item.amount_due, item.currency))}} </b-col>
          </b-row>

          <b-row :no-gutters="true" v-if="amountDuePerUser[row.item.user_id].length === 0">
            <b-col cols="12">
              This user hasn't made any bets
            </b-col>
          </b-row>
        </template>
      </template>
    </b-table>

    <b-pagination :total-rows="totalRows" :per-page="perPage" align="right" @change="fetchAffiliateUsers" />
  </div>
</template>

<script>
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bPagination from 'bootstrap-vue/es/components/pagination/pagination';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import Vue from 'vue';
  import {mapGetters} from 'vuex';
  import {addCommas, formatBigAmount, formatCurrency} from 'src/helpers';
  import api from 'src/api';

  export default {
    name: 'AffiliateUsers',
    components: {
      'b-table': bTable,
      'b-pagination': bPagination,
      'b-button': bButton,
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      totalRows: 0,
      renderData: [],
      amountDuePerUser: {},
      fetchingAmountDuePerUser: {},
      fields: [
        {key: 'show_details', label: '+'},
        {key: 'username', label: 'Username'},
        {key: 'currency', label: 'Currency', formatter: 'showCurrencySymbol'},
        {key: 'earnings', label: 'Total Earnings', formatter: 'formatAmount'}
      ]
    }),
    props: {
      data: {
        type: Object,
        required: true,
        default: {}
      },
      perPage: {
        type: Number,
        default: 10
      }
    },
    computed: mapGetters({
      currencies: 'currencies',
    }),
    watch: {
      data (dataFromProps) {
        if (!dataFromProps.results) return;
        this.totalRows = parseInt(dataFromProps.count, 10);
        this.renderData = dataFromProps.results;
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
        return this.addCommas(this.formatBigAmount(value, item.currency));
      },
      fetchAffiliateUsers (page) {
        const offset = (page - 1) * this.perPage;

        return api.getAffiliateUsers(this.perPage, offset)
          .then(res => {
            if (res.data && res.data.affiliateUsers && Array.isArray(res.data.affiliateUsers.results)) {
              this.totalRows = parseInt(res.data.affiliateUsers.count, 10);
              this.renderData = res.data.affiliateUsers.results;
            }
          });
      },
      fetchAmountDue (row) {
        const affiliateId = row.item.user_id;
        Vue.set(this.fetchingAmountDuePerUser, affiliateId, true);

        if (!row.detailsShowing) {
          api.getAffiliateAmountDue(affiliateId)
            .then((res) => {
              Vue.set(this.amountDuePerUser, affiliateId, res.data.amountsDueByCurrency);
              Vue.set(this.fetchingAmountDuePerUser, affiliateId, false);
            });
        }

        row.toggleDetails();
      }
    }
  };
</script>
