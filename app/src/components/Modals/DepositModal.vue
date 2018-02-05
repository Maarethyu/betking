<template>
  <b-modal id="depositModal" v-model="showModal" ref="modal" @hide="onModalHide" hide-footer lazy>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Deposit {{formatCurrency(depositModalCurrency, 'name')}}</template>

    <div class="alert alert-danger" v-if="errors.global">{{errors.global}}</div>

    <b-container fluid>
      <template v-if="depositAddress">
        <b-row>
          <b-col class="text-center">Use this address to deposit.</b-col>
        </b-row>
        <b-row>
          <b-col class="text-center">
            <img v-if="depositAddressQr && depositAddressQr.length > 0" :src="depositAddressQr" />
          </b-col>
        </b-row>
        <b-row>
          <b-col class="deposit-address">
            <CopyToClipboard v-bind:text="depositAddress"></CopyToClipboard>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            Deposits are credited after one confirmation on the blockchain.
          </b-col>
        </b-row>
      </template>
      <template v-if="!depositAddress">
        <b-row>
          <b-col class="text-danger">{{errorMessage}}</b-col>
        </b-row>
      </template>
    </b-container>

  </b-modal>
</template>

<script>
  import bModal from 'bootstrap-vue/es/components/modal/modal';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import {formatCurrency} from 'src/helpers';
  import api from 'src/api';
  import CopyToClipboard from '../CopyToClipboard';

  import {mapGetters} from 'vuex';

  export default {
    name: 'depositModal',
    components: {
      'b-modal': bModal,
      'b-container': bContainer,
      'b-row': bRow,
      'b-col': bCol,
      CopyToClipboard
    },
    data: () => ({
      showModal: false,
      errors: {},
      errorMessage: '',
      depositAddressQr: '',
      depositAddress: ''
    }),
    computed: {
      ...mapGetters({
        isDepositModalVisible: 'isDepositModalVisible',
        depositModalCurrency: 'depositModalCurrency',
        currencies: 'currencies'
      })
    },
    watch: {
      isDepositModalVisible (newValue) {
        this.showModal = newValue;
        if (newValue) {
          this.getDepositAddress(this.depositModalCurrency);
        }
      }
    },
    methods: {
      formatCurrency,
      getDepositAddress (value) {
        this.errors = '';
        api.getDepositAddress(value)
          .then(res => {
            this.depositAddress = res.data.address;
            this.depositAddressQr = res.data.addressQr;
          })
          .catch(e => {
            if (e.response && e.response.status === 400) {
              this.errorMessage = e.response.data.error === 'NO_DEPOSIT_ADDRESS_AVAILABLE' ? 'No deposit address available' : e.response.data.error;
            }

            throw e;
          });
      },
      hideModal () {
        this.$refs.modal && this.$refs.modal.hide();
      },
      onModalHide () {
        this.errors = {};
        this.depositAddress = '';
        this.depositAddressQr = '';
        this.$store.dispatch('hideDepositModal');
      }
    }
  };
</script>
