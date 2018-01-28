<template>
  <div>
    <select v-on:change="currencyChanged" v-model="activeCurrency">
      <option disabled="disabled" value="-1">Choose Currency</option>
      <option v-for="currency of currencies" :key="currency.value" :value="currency.value">
        {{ currency.name }}
      </option>
    </select>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  data: () => ({
    activeCurrency: -1
  }),
  computed: mapGetters({
    currencies: 'currencies'
  }),
  props: {
    default: {
      type: Number,
      default: -1
    }
  },
  mounted () {
    this.activeCurrency = this.default;
  },
  watch: {
    default (newValue) {
      /* To allow resetting currency selector from parent */
      if (newValue === -1) {
        this.activeCurrency = -1;
      }
    }
  },
  methods: {
    currencyChanged () {
      this.$emit('change', this.activeCurrency);
    }
  }
};
</script>
