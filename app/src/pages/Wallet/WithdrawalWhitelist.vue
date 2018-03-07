<template>
  <div>
    <div v-if="errors.global" class="alert alert-danger">{{ errors.global }}</div>

    <b-table
      ref="table"
      class="whitelisted-address"
      stacked="md"
      :items="renderData"
      :fields="fields"
      :show-empty="true"
      :foot-clone="true"
      :no-provider-sorting="true"
      empty-text="You don't have any whitelisted addresses"
      striped small outlined fixed hover>

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
    tfoot {
      display: table-footer-group!important;
    }
    &__currency {
      width: 25%;
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
  import {formatCurrency, getSecondFactorAuth} from 'src/helpers';

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
      renderData: [],
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
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    watch: {
      data (dataFromProps) {
        this.renderData = dataFromProps;
      }
    },
    methods: {
      getSecondFactorAuth,
      formatCurrency,
      showCurrencySymbol (value) {
        return this.formatCurrency(value);
      },
      refreshTable () {
        this.refreshForms();
        this.fetchWhitelistedAddresses();
      },
      fetchWhitelistedAddresses () {
        api.fetchWhitelistedAddresses()
          .then(res => {
            this.renderData = res.data.whitelistedAddresses;
          });
      },
      async removeWhitelistedAddress (currency) {
        this.otp = await this.getSecondFactorAuth();

        api.removeWhitelistedAddress(currency, this.otp)
          .then(() => {
            const currencyConfig = this.currencies.find(c => c.id === currency);

            if (currencyConfig) {
              toastr.success(`Removed whitelisted address for ${currencyConfig.name}`);
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
      async addWhitelistedAddress () {
        this.otp = await this.getSecondFactorAuth();

        api.addWhitelistedAddress(this.activeCurrency, this.activeAddress, this.otp)
          .then(() => {
            const currency = this.currencies.find(c => c.id === this.activeCurrency);

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
