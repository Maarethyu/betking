<template>
  <div>
    <select v-on:change="currencyChanged" v-model="activeCurrency">
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
    activeCurrency: null
  }),
  computed: mapGetters({
    currencies: 'currencies'
  }),
  methods: {
    currencyChanged () {
      this.$emit('change', this.activeCurrency);
    }
  }
};
</script>
