<template>
  <div>
    <h3>Deposit History</h3>
    <div>
      <table>
        <thead>
          <tr>
            <th>+</th>
            <th v-on:click="setSortBy('created_at')">Date</th>
            <th >Currency Name</th>
            <th v-on:click="setSortBy('amount')">Amount</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="tx in list">
            <tr :key="`row-${tx.id}`">
              <td>
                <button v-if="!tx.expanded" @click="showDetails(tx)">+</button>
                <button v-if="tx.expanded" @click="hideDetails(tx)">-</button>
              </td>
              <td>{{ formatDate(tx.created_at) }}</td>
              <td>{{ formatCurrency(tx.currency, sym) }}</td>
              <td>{{ addCommas(formatBigAmount(tx.amount, tx.currency)) }}</td>
            </tr>
            <tr v-if="tx.expanded">
              <td>address</td>
              <td>{{ tx.address }}</td>
            </tr>
            <tr v-if="tx.expanded">
              <td>Transaction id</td>
              <td>{{ tx.txid }}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <div v-if="!count">You have no completed Deposits.</div>
      <button v-if="skip >= limit" @click='prev'>Previous</button>
      <button v-if="skip + limit <= count - 1" @click='next'>Next</button>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import moment from 'moment';
import {addCommas, formatBigAmount, formatCurrency} from 'src/helpers';
import api from 'src/api';

export default {
  name: 'WithdrawalHistory',
  data: () => ({
    limit: 10,
    skip: 0,
    sort: 'created_at',
    list: [],
    count: 0,
    sym: 'symbol'
  }),
  computed: {
    ...mapGetters({
      currencies: 'currencies',
    })
  },
  mounted () {
    this.fetchDepositHistory();
  },
  methods: {
    formatBigAmount,
    formatCurrency,
    addCommas,
    fetchDepositHistory () {
      api.fetchDepositHistory(this.limit, this.skip, this.sort)
      .then(res => {
        if (res && res.data && Array.isArray(res.data.results)) {
          this.list = res.data.results.map(tx => {
            tx.expanded = false;
            return tx;
          });
          this.count = parseInt(res.data.count, 10);
        }
      });
    },
    setSortBy (field) {
      this.sort = field;
      this.fetchDepositHistory();
    },
    prev () {
      this.skip -= this.limit;
      this.fetchDepositHistory();
    },
    next () {
      this.skip += this.limit;
      this.fetchDepositHistory();
    },
    showDetails (tx) {
      tx.expanded = true;
    },
    hideDetails (tx) {
      tx.expanded = false;
    },
    formatDate (ts) {
      return moment(ts).format('LLL');
    }
  }
};
</script>
