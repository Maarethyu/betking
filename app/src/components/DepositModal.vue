<template>
  <transition name="modal">
    <div class="modal-mask" ref="modalMask">
      <div class="modal-wrapper">
        <div class="modal-container text-center">
          <div class="modal-header">
            Deposit {{ currency.name }}
          </div>
          <div class="modal-body">
            <template name="body" v-if="depositAddress">
              <div class="row">
                <div class="col-md-12">
                  <p>
                    Use this address to deposit
                  </p>
                </div>
              </div>
              <br/>
              <div class="row">
                <div class="col-md-12">
                  <img v-if="depositAddressQr && depositAddressQr.length > 0" :src="depositAddressQr" />
                  <br />
                  <br />
                  <div>{{depositAddress}}</div>
                </div>
              </div>
              <p>Deposits are credited after one confirmation on the blockchain.</p>
            </template>
            <template v-if="!depositAddressQr">
              <div class="row">
                <div class="col-md-12 text-danger">
                  {{errorMessage}}
                </div>
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <slot name="footer">
              <button class="btn btn-default" v-on:click="cancel">
                Close
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import api from 'src/api';

export default {
  name: 'DepositModal',
  data: () => ({
    depositAddress: '',
    depositAddressQr: '',
    errorMessage: ''
  }),
  props: ['currency'],
  mounted () {
    this.getDepositAddress(this.currency);
  },
  methods: {
    getDepositAddress (currency) {
      this.error = '';
      api.getDepositAddress(currency.value)
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
    cancel () {
      this.$emit('close');
    }
  }
};
</script>
<style>
  modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }

  .modal-container {
<<<<<<< HEAD
=======
    width: 600px;
>>>>>>> master
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
  }

  .modal-header h3 {
    margin-top: 0;
    color: #42b983;
  }

  .modal-body {
    margin: 20px 0;
  }

  .modal-default-button {
    float: right;
  }

  /*
   * The following styles are auto-applied to elements with
   * transition="modal" when their visibility is toggled
   * by Vue.js.
   *
   * You can easily play with the modal transition by editing
   * these styles.
   */

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>
