<template>
  <div>
    <h3>Balances</h3>

    <label for="hideZeroBalances">Hide Zero Balances</label>
    <input id="hideZeroBalances" type="checkbox" v-model="hideZeroBalances">

    <table>
      <thead>
        <tr>
          <th>+</th>
          <th v-on:click="setSortBy('name')">Currency Name</th>
          <th v-on:click="setSortBy('code')">Code</th>
          <th class="numeric" v-on:click="setSortBy('balance')">Available Balance</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="currency in balances" :key="currency.code">
          <td>
            <button>+</button>
            <button>-</button>
          </td>
          <td>{{ currency.name }}</td>
          <td>{{ currency.code }}</td>
          <td class="numeric">{{ addCommas(formatAmount(currency.balance, currency.scale)) }}</td>
        </tr>
      </tbody>
    </table>

    <div>
      <button v-if="offset !== 0" @click='prev'>Previous</button>
      <button v-if="balances.length === this.limit" @click='next'>Next</button>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import {addCommas, formatAmount} from 'src/helpers';

export default {
  name: 'Balances',
  data: () => ({
    hideZeroBalances: false,
    sortBy: 'balance',
    sortDir: -1,
    limit: 10,
    offset: 0
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

      return currencies
        .sort((a, b) => {
          const stringFields = ['name', 'code'];

          if (stringFields.indexOf(this.sortBy) > -1) {
            return a[this.sortBy].localeCompare(b[this.sortBy]) * this.sortDir;
          }

          return (a[this.sortBy] - b[this.sortBy]) * this.sortDir;
        })
        .slice(this.offset, this.limit + this.offset);
    }
  },
  mounted () {
    this.fetchBalances();
  },
  methods: {
    formatAmount,
    addCommas,
    fetchBalances () {
      this.$store.dispatch('fetchAllBalances');
    },
    setSortBy (field) {
      if (field === this.sortBy) {
        this.sortDir *= -1;
        return;
      }

      this.sortBy = field;
      this.sortDir = 1;
    },
    prev () {
      if (this.offset - this.limit >= 0) {
        this.offset -= this.limit;
      } else {
        this.offset = 0;
      }
    },
    next () {
      this.offset += this.balances.length;
    }
  }
};
</script>
