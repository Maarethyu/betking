<template>
  <div class="info-bar">
    <div class="ml-auto d-none d-sm-none d-md-inline">
      <div class="info-bar__item">
        <span class="text-red">Online: </span>123
      </div>
      <div class="info-bar__item" v-if="totalBets">
        <span class="text-red">Bets: </span>
        {{ addCommas(totalBets) }}
      </div>
      <div class="info-bar__item">
        <span class="text-red">Won last 24 hours: </span> 123.12 BTC
      </div>
      <div class="info-bar__item info-bar__item--max-win" v-if="path === '/dice'">
        <span class="text-red">Max Win: </span>
        {{ diceMaxWin }}
        <CurrencyIcon :id="activeCurrency" :width="18" />
      </div>
    </div>
    <div class="ml-auto">
      <button class="navbar-toggler-alt aside-menu-toggler" type="button" @click="toggleChat">
        <span class="icon-bubble"></span>
      </button>
    </div>
  </div>
</template>
<style lang="scss">
.info-bar {
  border-bottom: 1px solid #c2cfd6;
  display: flex;
  align-items: center;
  background-color: #fff;
  font-family:roboto;
  font-weight:500;
  font-size:14px;
  text-transform:uppercase;
  height: 50px;

  @media screen
  and (max-height: 520px)
  and (orientation: landscape) {
    display:none; // Hide on mobile landscape to "fullscreen" games
  }

  &__item {
    display: inline-block;
    padding-right: 0.25rem;
    padding-left: 0.25rem;
    height:22px;
    line-height:22px;
    color:#1b262d;

    &--max-win {
      img {
        position: relative;
        top: -1px;
      }
    }
  }
}
</style>
<script>
  import bToggle from 'bootstrap-vue/es/directives/toggle/toggle';
  import CurrencyIcon from 'components/CurrencyIcon';

  import {mapGetters, mapState} from 'vuex';
  import {addCommas} from 'src/helpers';

  export default {
    directives: {
      'b-toggle': bToggle
    },
    components: {
      CurrencyIcon
    },
    props: {
      toggleChat: {
        type: Function,
        default: () => {}
      }
    },
    computed: {
      ...mapGetters({
        diceMaxWin: 'diceMaxWin',
        activeCurrency: 'activeCurrency',
        totalBets: 'totalBets'
      }),
      ...mapState({
        path: state => state.route.path
      })
    },
    methods: {
      addCommas
    }
  };
</script>
