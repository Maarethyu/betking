<template>
  <b-modal id="validateSecondFactorAuthModal" ref="modal" @hide="hideModal" hide-footer>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Two-factor authentication</template>
    <b-container fluid>
      <b-row>
        <b-col>
          <p>
            Please enter 6 digit two-factor authentication code from Authenticator app.
          </p>
          <b-form-group label="Six digit code" label-for="code">
            <b-form-input
              type="text"
              id="code"
              v-model="code"/>
          </b-form-group>
        </b-col>
      </b-row>
    </b-container>
    <div class="pull-right">
        <button class="btn btn-danger" type="button" @click="closeModal">Cancel</button>
        <button class="btn btn-success" type="submit" @click="submitCode">Validate</button>
    </div>
  </b-modal>
</template>

<script>
  import bModal from 'bootstrap-vue/es/components/modal/modal';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import bus from 'src/bus';

  export default {
    name: 'AutenticateSecondFactor',
    components: {
      'b-modal': bModal,
      'b-form-group': bFormGroup,
      'b-form-input': bFormInput,
      'b-container': bContainer,
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      code: null,
      showModal: false
    }),
    methods: {
      closeModal () {
        this.$refs.modal.hide();
      },
      submitCode () {
        bus.$emit('authenticate-second-factor', this.code);
      },
      hideModal () {
        this.code = '';
        bus.$emit('cancel-second-factor-auth');
      }
    }
  };
</script>
