<template lang="html">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container text-center">
          <div class="modal-header">
            <div class="success" v-if="message">{{ message }}</div>
            <div class="error">{{ errors }}</div>
            <h3 class="">Withdraw {{currency.name}}</h3>
            <div>Available balance: {{currency.balance}}</div>
            <div>Withdrawal Fee: {{currency.wdFee}}</div>
            <div>Minimum Withdrawal limit: {{currency.minWdLimit}}</div>
            <div>Maximum Withdrawal limit: {{currency.maxWdLimit}}</div>
            <form v-on:submit.prevent="onSubmit">
              <input type="number" step="any" name="" placeholder="Enter withdrawal amount" v-model="amount">
              <input type="text" name="" placeholder="Enter the address" v-model="address">
              <button class="btn btn-primary" type="submit">Submit</button>
              <button class="btn btn-default" v-on:click.prevent="$emit('close')">Close</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import api from 'src/api';
import BigNumber from 'bignumber.js';

export default {
  name: 'Withdrawal',
  data: () => ({
    amount: 0,
    address: '',
    errors: null,
    message: ''
  }),
  props: ['currency'],
  mounted () {
  },
  methods: {
    onSubmit () {
      const bigAmount = new BigNumber(this.amount).times(new BigNumber(10).pow(this.currency.scale));
      api.withdrawCurrency({currency: this.currency.value, amount: bigAmount, address: this.address})
      .then(res => {
        this.$emit('close');
        this.$emit('withdrawalComplete');
      })
      .catch(error => {
        if (error.response && error.response.status === 400 && Array.isArray(error.response.data.errors)) {
          const newErrors = {};
          error.response.data.errors.forEach(error => {
            newErrors[error.param] = newErrors[error.param]
              ? `${newErrors[error.param]} / ${error.msg}`
              : error.msg;
          });

          this.errors = newErrors;
        } else {
          this.errors = error.response.data.error;
        }
        this.message = '';
      });
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
  width: 300px;
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
