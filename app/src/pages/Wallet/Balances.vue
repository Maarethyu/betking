<template>
  <div id="balances-table">
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
      head-variant="dark"
      responsive small outlined hover>
      <template slot="HEAD_id" slot-scope="data">
        <i class="fa fa-plus"></i>
      </template>
      <template slot="id" slot-scope="data">
        <span @click="openDepositModal(data.item.id)"><i class="fa fa-plus"></i></span>
        <span @click="openWithdrawModal(data.item.id)"><i class="fa fa-minus"></i></span>
      </template>
    </b-table>

    <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" align="center" />
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
        'id',
        {key: 'name', label: 'CURRENCY NAME', sortable: true},
        {key: 'symbol', label: 'CURRENCY SYMBOL', sortable: true},
        {key: 'balance', label: 'BALANCE', formatter: 'formatBalance', sortable: true}
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

<style lang="scss">
  #balances-table {
    .custom-control-label::after {
      background: #f5f5f5;
      border: solid 1px gray;
    }
  }
</style>

