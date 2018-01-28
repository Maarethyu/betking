<template>
  <div>
    <div class="success">{{ successMessage }}</div>
    <div class="error">{{ errors.global }}</div>

    <table>
      <thead>
        <th>#</th>
        <th>Currency</th>
        <th>Address</th>
        <th></th>
      </thead>

      <tbody>
        <tr v-for="(row, idx) of whitelistedAddresses" :key="row.address">
          <td>{{ idx + 1 }}</td>
          <td>{{ formatCurrency(row.currency) }}</td>
          <td>{{ row.address }}</td>
          <td><button @click="removeWhitelistedAddress(row.currency)">Remove</button></td>
        </tr>

        <tr>
          <td>Add new</td>
          <td>
            <CurrencySelector @change="updateCurrency" :default="activeCurrency"></CurrencySelector>
            <div class="error">{{ errors.currency }}</div>
          </td>
          <td>
            <input v-model="activeAddress" placeholder="Address">
            <div class="error">{{ errors.address }}</div>
          </td>
          <td>
            <button @click="addWhitelistedAddress()" :disabled="activeCurrency === null || !activeAddress">
              Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import api from 'src/api';
import {formatCurrency} from 'src/helpers';

import CurrencySelector from 'components/CurrencySelector';

export default {
  name: 'WithdrawalWhitelistedAddress',
  components: {
    CurrencySelector
  },
  data: () => ({
    activeCurrency: -1,
    activeAddress: null,
    whitelistedAddresses: [],
    errors: {},
    successMessage: '',
    otp: null
  }),
  computed: mapGetters({
    currencies: 'currencies',
    is2faEnabled: 'is2faEnabled'
  }),
  mounted () {
    this.fetchWhitelistedAddresses();
  },
  methods: {
    formatCurrency,
    fetchWhitelistedAddresses () {
      api.fetchWhitelistedAddresses()
        .then(res => {
          this.whitelistedAddresses = res.data.whitelistedAddresses;
          this.refreshForms();
        });
    },
    removeWhitelistedAddress (currency) {
      if (this.is2faEnabled) {
        // TODO: Write a proper vue component for modal
        this.otp = prompt('Enter two factor otp');
      }

      api.removeWhitelistedAddress(currency, this.otp)
        .then(() => {
          this.fetchWhitelistedAddresses();
        })
        .catch(error => {
          if (error.response) {
            this.buildErrors(error.response);
            return;
          }

          throw error;
        });
    },
    addWhitelistedAddress () {
      if (this.is2faEnabled) {
        // TODO: Write a proper vue component for modal
        this.otp = prompt('Enter two factor otp');
      }

      api.addWhitelistedAddress(this.activeCurrency, this.activeAddress, this.otp)
        .then(() => {
          this.fetchWhitelistedAddresses();
        })
        .catch(error => {
          if (error.response) {
            this.buildErrors(error.response);
            return;
          }

          throw error;
        });
    },
    updateCurrency (currency) {
      this.activeCurrency = currency;
    },
    refreshForms () {
      this.errors = {};
      this.successMessage = '';
      this.activeCurrency = -1;
      this.activeAddress = null;
    },
    buildErrors (response) {
      if (response && response.status === 400) {
        if (response.data.errors) {
          const newErrors = {};

          response.data.errors.forEach(error => {
            newErrors[error.param] = newErrors[error.param]
              ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
          });

          this.errors = newErrors;
          return;
        }

        if (response.data.error) {
          this.errors = {
            global: response.data.error === 'CURRENCY_ALREADY_WHITELISTED'
              ? 'You already have an address whitelisted for this currency'
              : response.data.error
          };
        }
      }
    }
  }
};
</script>
