<template>
  <img :class="className" v-b-tooltip.hover :title="name" :src="src" :alt="symbol" :width="width" :height="width"/>
</template>

<script>
  import {mapGetters} from 'vuex';
  import vBTooltip from 'bootstrap-vue/es/directives/tooltip/tooltip';

  export default {
    props: {
      id: {
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
    directives: {
      'b-tooltip': vBTooltip
    },
    computed: {
      ...mapGetters({
        currencies: 'currencies'
      }),
      currency () {
        return this.currencies.find(c => c.id === this.id);
      },
      symbol () {
        return this.currency && this.currency.symbol;
      },
      name () {
        return this.currency && this.currency.name;
      },
      src () {
        if (!this.symbol) return;

        const color = this.color ? `_${this.color}` : '';

        return `/static/img/currencies/${this.symbol}${color}.svg`;
      }
    }
  };
</script>
