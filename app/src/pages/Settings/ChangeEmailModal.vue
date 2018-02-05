<template>
  <b-modal id="changeEmailModal" ref="modal" @hide="onModalHide" hide-footer lazy>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Change Email</template>

    <div v-if="errors.changeEmailError" class="alert alert-danger">{{errors.changeEmailError}}</div>

    <b-form v-on:submit.prevent="changeEmail">
      <b-form-group label="New email" label-for="new-email" :invalid-feedback="errors.email" :state="!errors.email">
        <b-form-input id="new-email" placeholder="Email" name="email" v-model="newEmail" :state="!errors.email && newEmail" />
      </b-form-group>

      <b-button type="submit" variant="success">Change Email</b-button>
    </b-form>
  </b-modal>
</template>

<script>
  import bModal from 'bootstrap-vue/es/components/modal/modal';
  import bForm from 'bootstrap-vue/es/components/form/form';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bButton from 'bootstrap-vue/es/components/button/button';

  import api from 'src/api';

  export default {
    name: 'ChangeEmailModal',
    data: () => ({
      errors: {},
      newEmail: '',
    }),
    components: {
      'b-modal': bModal,
      'b-form': bForm,
      'b-form-group': bFormGroup,
      'b-form-input': bFormInput,
      'b-button': bButton
    },
    methods: {
      closeModal () {
        this.$refs.modal.hide();
      },
      onModalHide () {
        this.newEmail = '';
        this.errors = {};
      },
      changeEmail (e) {
        const data = {
          email: e.target.elements.email.value,
        };

        api.changeEmail(data)
          .then(res => {
            this.$emit('email-changed');
            this.closeModal();
          })
          .catch(error => {
            this.showErrors(error.response);
          });
      },
      showErrors (response) {
        if (response && response.status === 400) {
          const newErrors = {};

          response.data.errors.forEach(error => {
            newErrors[error.param] = newErrors[error.param]
              ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
          });

          this.errors = newErrors;
          return;
        }

        if (response && response.status === 409) {
          this.errors = {
            changeEmailError: response.data.error,
          };
        }
      },
    }
  };
</script>
