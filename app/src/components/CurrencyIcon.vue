<template>
  <img :class="className" :src="src" :alt="symbol" :width="width" :height="width"/>
</template>

<script>
  import {mapGetters} from 'vuex';

  export default {
    props: {
      value: {
        default: null,
        type: Number
      },
      color: {
        default: null,
        type: String
      },
      width: {
        default: 20,
        type: Number
      },
      className: {
        default: '',
        type: String
      }
    },
    computed: {
      ...mapGetters({
        currencies: 'currencies'
      }),
      currency () {
        return this.currencies.find(c => c.value === this.value);
      },
      symbol () {
        return this.currency && this.currency.symbol;
      },
      src () {
        if (!this.symbol) return;

        const color = this.color ? `_${this.color}` : '';

        return `/static/img/currencies/${this.symbol}${color}.svg`;
      }
    }
  };
</script>
