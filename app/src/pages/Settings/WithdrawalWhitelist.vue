<template>
  <div>
    <div v-if="errors.global" class="alert alert-danger">{{ errors.global }}</div>

    <b-table
      ref="table"
      class="whitelisted-address"
      :items="fetchWhitelistedAddresses"
      :fields="fields"
      :show-empty="true"
      :foot-clone="true"
      :no-provider-sorting="true"
      empty-text="You don't have any whitelisted addresses"
      responsive striped small outlined fixed hover>

      <template slot="+" slot-scope="row">
        <b-button variant="default" size="sm" @click="removeWhitelistedAddress(row.item.currency)">
          Remove
        </b-button>
      </template>

      <template slot="FOOT_currency" slot-scope="data">
        <CurrencySelector @change="updateCurrency" :default="activeCurrency"></CurrencySelector>
      </template>

      <template slot="FOOT_address" slot-scope="data">
        <b-form-input v-model="activeAddress" placeholder="Address" :state="activeAddress && !errors.address" />
        <b-form-invalid-feedback>{{errors.address}}</b-form-invalid-feedback>
      </template>

      <template slot="FOOT_+" slot-scope="data">
        <b-button variant="default"  @click="addWhitelistedAddress()" :disabled="activeCurrency === null || !activeAddress">
          Add
        </b-button>
      </template>
    </b-table>
  </div>
</template>

<style lang="scss">
  .whitelisted-address {
    &__currency {
      width: 20%;
    }
  }
</style>


<script>
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bFormInvalidFeedback from 'bootstrap-vue/es/components/form/form-invalid-feedback';
  import {mapGetters} from 'vuex';
  import toastr from 'toastr';
  import api from 'src/api';
  import {formatCurrency} from 'src/helpers';

  import CurrencySelector from 'components/CurrencySelector';

  export default {
    name: 'WithdrawalWhitelistedAddress',
    components: {
      'b-table': bTable,
      'b-button': bButton,
      'b-form-input': bFormInput,
      'b-form-invalid-feedback': bFormInvalidFeedback,
      CurrencySelector
    },
    data: () => ({
      activeCurrency: -1,
      activeAddress: null,
      whitelistedAddresses: [],
      errors: {},
      successMessage: '',
      otp: null,
      fields: [
        {key: 'currency', label: 'Currency', formatter: 'showCurrencySymbol', class: 'whitelisted-address__currency'},
        {key: 'address', label: 'Address'},
        '+'
      ]
    }),
    computed: mapGetters({
      currencies: 'currencies',
      is2faEnabled: 'is2faEnabled'
    }),
    methods: {
      formatCurrency,
      showCurrencySymbol (value) {
        return this.formatCurrency(value);
      },
      refreshTable () {
        this.refreshForms();
        this.$refs.table.refresh();
      },
      fetchWhitelistedAddresses () {
        return api.fetchWhitelistedAddresses()
          .then(res => {
            return res.data.whitelistedAddresses;
          });
      },
      removeWhitelistedAddress (currency) {
        if (this.is2faEnabled) {
          // TODO: Write a proper vue component for modal
          this.otp = prompt('Enter two factor otp');
        }

        api.removeWhitelistedAddress(currency, this.otp)
          .then(() => {
            const currencyConfig = this.currencies.find(c => c.value === currency);

            if (currencyConfig) {
              toastr.success(`Removed whitelisted address for ${currencyConfig.name}`);
            }

            this.refreshTable()
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
            const currency = this.currencies.find(c => c.value === this.activeCurrency);

            if (currency) {
              toastr.success(`Added whitelisted address for ${currency.name}`);
            }

            this.refreshTable();
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
