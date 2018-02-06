<template>
  <b-modal id="diceProvablyFairModal" ref="modal" hide-footer lazy>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Provably Fair</template>

    <b-row>
      <b-col cols="12">
        <p>For details on what provably fair means and how to verify your rolls <a href="https://betking.io/provably-fair" target="_blank">click here</a></p>
      </b-col>
    </b-row>

    <br>

    <button class="btn btn-danger float-right" @click="closeModal">Close</button>
  </b-modal>
</template>

<style>
</style>

<script>
  import bModal from 'bootstrap-vue/es/components/modal/modal';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  export default {
    name: 'ProvablyFairModal',
    components: {
      'b-modal': bModal,
      'b-row': bRow,
      'b-col': bCol
    },
    methods: {
      closeModal () {
        this.$refs.modal.hide();
      }
    }
  };
</script>
