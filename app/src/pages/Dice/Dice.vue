<template>
  <div class="dice animated fadeIn">
    <BetControls />

    <br>
    <b-row>
      <b-col cols="12" sm="10" offset-sm="1">
        <BetResults />
      </b-col>
    </b-row>
  </div>
</template>

<style lang="scss">
  .dice {
    margin-top: 10px;
  }
</style>

<script>
  import BetControls from './BetControls';
  import BetResults from './BetResults';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import uuid from 'uuid';
  import {mapGetters} from 'vuex';

  export default {
    name: 'Dice',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      BetControls,
      BetResults
    },
    computed: mapGetters({
      isAuthenticated: 'isAuthenticated',
      activeCurrency: 'activeCurrency'
    }),
    mounted () {
      this.loadDiceState();
    },
    watch: {
      isAuthenticated () {
        this.loadDiceState();
      },
      activeCurrency () {
        this.loadDiceState();
      }
    },
    methods: {
      loadDiceState () {
        if (this.isAuthenticated) {
          const clientSeed = uuid.v4();
          this.$store.dispatch('loadDiceState', {clientSeed, currency: this.activeCurrency});
        }
      }
    }
  };
</script>
