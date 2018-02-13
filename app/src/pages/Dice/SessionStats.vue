<template>
  <b-container>
    <b-row class="session-stats" v-for="stat in sessionStats" :key="stat.currency" align-v="center" align-h="center">
      <b-col cols="2" class="session-stats__stat">
        <CurrencyIcon :value="stat.currency" :width="25" />
      </b-col>

      <b-col cols="2" class="session-stats__stat">
        {{ stat.numBets }}
        <div class="session-stats__label">
          Bets
        </div>
      </b-col>

      <b-col cols="4" class="session-stats__stat">
        <span v-html="colorProfit(formatBigAmount(stat.profit, stat.currency))" />
        <div class="session-stats__label">
          Profit
        </div>
      </b-col>

      <b-col cols="4" class="session-stats__stat">
        {{ formatBigAmount(stat.wagered, stat.currency) }}
        <div class="session-stats__label">
          Wagered
        </div>
      </b-col>
    </b-row>
    <b-row  class="session-stats" v-if="sessionStats.length === 0" align-v="center" align-h="center">
      <b-col cols="12" class="session-stats__stat">
        You haven't made any bets in this session
      </b-col>
    </b-row>
  </b-container>
</template>

<style lang="scss" scoped>
  .session-stats {
    height: 56px;
    &__stat {
      text-align: center;
      font-size: 16px;
    }
    &__label {
      font-size: 12px;
      opacity: 0.8;
    }
  }
</style>


<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import CurrencyIcon from 'components/CurrencyIcon';

  import {mapGetters} from 'vuex';
  import {formatBigAmount} from 'src/helpers';

  export default {
    name: 'SessionStats',
    components: {
      'b-container': bContainer,
      'b-row': bRow,
      'b-col': bCol,
      CurrencyIcon
    },
    computed: mapGetters({
      sessionStats: 'sessionStats',
      currencies: 'currencies'
    }),
    methods: {
      formatBigAmount,
      colorProfit (profit) {
        const className = profit > 0 ? 'text-green' : 'text-red';
        return `<span class="${className}">${profit}</span>`;
      }
    }
  };
</script>
