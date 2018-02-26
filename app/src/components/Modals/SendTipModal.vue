<template>
  <b-modal id="sendTipModal" ref="modal" @hide="onModalHide" hide-footer>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Send tip to {{username}}</template>

    <b-container fluid>
      <b-row>
        <b-col cols="6">
          <b-dropdown>
            <template slot="button-content">
              <span v-if="!activeCurrency && activeCurrency !== 0">Select currency</span>
              <span v-else><CurrencyIcon :id="activeCurrency" :width="15" /> {{formatCurrency(activeCurrency, 'name')}}</span>
            </template>
            <template v-for="currency in currencies">
              <b-dropdown-item @click.prevent="setCurrency(currency.id)">
                <span><CurrencyIcon :id="currency.id" :width="15" /> {{formatCurrency(currency.id, 'name')}}</span>
              </b-dropdown-item>
            </template>
          </b-dropdown>
        </b-col>
        <b-col cols="6" v-if="activeCurrency || activeCurrency === 0">
          <span>Min Tip Amount: {{formatBigAmount(formatCurrency(activeCurrency, 'min_tip'), activeCurrency)}}</span>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group label="Amount"
                        label-for="amount"
                        invalid-feedback="Amount must be greater than min tip amount.">
            <b-form-input id="amount"
                          type="number"
                          steps="any"
                          placeholder="Amount"
                          :state="isAmountValid"
                          v-model="amount">
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
      <button class="btn btn-danger float-right" @click.prevent="hideModal">Close</button>
      <button class="btn btn-success float-right mr-2" @click.prevent="sendTip" :disabled="isSendDisabled">Send Tip</button>
    </b-container>
  </b-modal>
</template>

<script>
  import bModal from 'components/modal/modal';
  import bForm from 'bootstrap-vue/es/components/form/form';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown';
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';

  import toastr from 'toastr';
  import {mapGetters} from 'vuex';

  import CurrencyIcon from 'components/CurrencyIcon';
  import {formatCurrency, formatBigAmount, toBigInt} from 'src/helpers';
  import api from 'src/api';
  import bus from 'src/bus';

  export default {
    name: 'SendTipModal',
    components: {
      'b-modal': bModal,
      'b-form': bForm,
      'b-form-group': bFormGroup,
      'b-form-input': bFormInput,
      'b-container': bContainer,
      'b-row': bRow,
      'b-col': bCol,
      'b-dropdown': bDropdown,
      'b-dropdown-item': bDropdownItem,
      CurrencyIcon
    },
    data: () => ({
      errors: {},
      activeCurrency: null,
      amount: 0
    }),
    computed: {
      ...mapGetters({
        currencies: 'currencies'
      }),
      isAmountValid () {
        if (!this.amount) {
          return null;
        }
        return this.amount >= this.formatBigAmount(this.formatCurrency(this.activeCurrency, 'min_tip'), this.activeCurrency);
      },
      isSendDisabled () {
        return !this.isAmountValid || (!this.activeCurrency && this.activeCurrency !== 0);
      }
    },
    props: {
      username: {
        type: String,
        required: true,
        default: ''
      }
    },
    methods: {
      formatCurrency,
      formatBigAmount,
      toBigInt,
      hideModal () {
        this.$refs.modal && this.$refs.modal.hide();
      },
      onModalHide () {
        this.errors = {};
        this.activeCurrency = null;
        this.amount = 0;
        bus.$emit('send-tip-modal-closed');
      },
      sendTip () {
        const data = {
          amount: this.toBigInt(this.amount, this.formatCurrency(this.activeCurrency, 'scale')),
          username: this.username,
          currency: this.activeCurrency
        };
        api.sendTip(data)
        .then(data => {
          this.errors = {};
          this.$store.dispatch('fetchAllBalances');
          toastr.success(` ${this.amount} ${this.formatCurrency(this.activeCurrency)} sent to ${this.username}`);
        })
        .catch(e => {
          if (e.response) {
            this.buildErrors(e.response);
            return;
          }

          throw e;
        });
      },
      setCurrency (value) {
        this.activeCurrency = value;
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
            switch (response.data.error) {
              case 'INSUFFICIENT_BALANCE':
                this.errors.global = 'Balance too low.';
                break;
              case 'USERNAME_DOES_NOT_EXIST':
                this.errors.global = 'Username does not exist.';
                break;
              default:
                this.errors.global = response.data.error;
            }
            toastr.error(this.errors.global);
          }
        }
      }
    }
  };
</script>
