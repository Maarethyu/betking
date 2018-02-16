<template>
  <div>
    <b-form-checkbox id="hide-zero-balances" v-model="hideZeroBalances">
      Hide Zero Balances
    </b-form-checkbox>

    <b-table
      stacked="sm"
      :per-page="perPage"
      :current-page="currentPage"
      :items="balances"
      :fields="fields"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      responsive striped small outlined hover>
      <template slot="id" slot-scope="data">
        <b-button  size="sm" variant="default" @click="openDepositModal(data.item.id)">+</b-button>
        <b-button  size="sm" variant="default" @click="openWithdrawModal(data.item.id)">-</b-button>
      </template>
    </b-table>

    <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" align="right" />
  </div>
</template>

<script>
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox';
  import bPagination from 'bootstrap-vue/es/components/pagination/pagination';
  import bButton from 'bootstrap-vue/es/components/button/button';

  import {mapGetters} from 'vuex';
  import {addCommas, formatAmount} from 'src/helpers';

  export default {
    name: 'Balances',
    components: {
      'b-table': bTable,
      'b-form-checkbox': bFormCheckbox,
      'b-pagination': bPagination,
      'b-button': bButton
    },
    data: () => ({
      hideZeroBalances: false,
      perPage: 10,
      currentPage: 1,
      sortBy: 'balance',
      sortDesc: true,
      fields: [
        {key: 'id', label: '+'},
        {key: 'name', label: 'Name', sortable: true},
        {key: 'symbol', label: 'Symbol', sortable: true},
        {key: 'balance', label: 'Balance', formatter: 'formatBalance', sortable: true}
      ]
    }),
    computed: {
      ...mapGetters({
        currencies: 'currencies',
      }),
      balances () {
        let currencies = this.currencies.slice();

        if (this.hideZeroBalances) {
          currencies = currencies.filter(c => c.balance > 0);
        }

        return currencies;
      },
      totalRows () {
        return this.balances.length;
      }
    },
    mounted () {
      this.fetchBalances();
      this.formatAmount = this.formatAmount.bind(this);
    },
    methods: {
      formatAmount,
      addCommas,
      formatBalance (value, key, item) {
        return this.addCommas(this.formatAmount(value, item.id));
      },
      filterData (item) {
        if (this.hideZeroBalances) {
          return item.balance > 0;
        }

        return true;
      },
      fetchBalances () {
        this.$store.dispatch('fetchAllBalances');
      },
      openDepositModal (currency) {
        this.$store.dispatch('showDepositModal', currency);
      },
      openWithdrawModal (currency) {
        this.$root.$emit('bv::table::refresh', 'wallet-pending-withdrawals');
        this.$store.dispatch('showWithdrawalModal', currency);
      }
    }
  };
</script>
