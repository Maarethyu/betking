<template>
  <b-dropdown variant="default">
    <template slot="button-content">
      {{ name }} <CurrencyIcon v-if="activeCurrency !== -1" :id="activeCurrency" :width="20" />
    </template>

    <b-dropdown-item v-if="showAllCurrenciesOption" @click="currencyChanged({id: -1})">
      {{ defaultName }}
    </b-dropdown-item>

    <b-dropdown-item v-for="currency of currencies" :key="currency.id" @click="currencyChanged(currency)">
      <span class="float-left">{{ currency.name }}</span>
      <CurrencyIcon :className="'float-right'" :id="currency.id" :width="15" />
      <div class="clearfix" />
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
  import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown';
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
  import CurrencyIcon from 'components/CurrencyIcon';

  import {mapGetters} from 'vuex';

  export default {
    data: () => ({
      activeCurrency: -1
    }),
    components: {
      'b-dropdown': bDropdown,
      'b-dropdown-item': bDropdownItem,
      CurrencyIcon
    },
    computed: {
      ...mapGetters({
        currencies: 'currencies'
      }),
      name () {
        const currency = this.currencies.find(c => c.id === this.activeCurrency);

        if (currency) {
          return currency.name;
        } else {
          return this.defaultName;
        }
      }
    },
    props: {
      default: {
        type: Number,
        default: -1
      },
      defaultName: {
        type: String,
        default: 'Choose Currency'
      },
      showAllCurrenciesOption: {
        type: Boolean,
        default: false
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
      currencyChanged (currency) {
        this.activeCurrency = currency.id;
        this.$emit('change', currency.id);
      }
    }
  };
</script>
