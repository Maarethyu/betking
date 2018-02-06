<template>
  <b-modal id="maxBetModal" ref="modal" hide-footer lazy>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Max Bet?</template>

    <b-row>
      <b-col cols="12">
        <p>You pressed the max bet button.</p>
        <p>Are you sure you want to bet your whole balance?</p>
        <b-form-checkbox id="checkbox1" v-model="stopWarning">
          Don't ask me again.
        </b-form-checkbox>
      </b-col>
    </b-row>

    <br>

    <div class="submit-buttons pull-right">
      <button class="btn btn-danger" @click="closeModal">No</button>
      <button class="btn btn-success" @click="maxBet">Yes</button>
    </div>
  </b-modal>
</template>

<script>
  import bModal from 'bootstrap-vue/es/components/modal/modal';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox';

  export default {
    name: 'MaxBetWarningDialog',
    components: {
      'b-modal': bModal,
      'b-row': bRow,
      'b-col': bCol,
      'b-form-checkbox': bFormCheckbox
    },
    data: () => ({
      stopWarning: false
    }),
    methods: {
      closeModal () {
        this.$refs.modal.hide();
      },
      maxBet () {
        this.$emit('maxbet', this.stopWarning);
      }
    }
  };
</script>
