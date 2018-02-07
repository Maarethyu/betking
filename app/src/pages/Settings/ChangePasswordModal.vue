<template>
  <b-modal id="changePasswordModal" ref="modal" @hide="onModalHide" hide-footer lazy>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Change Email</template>

    <div v-if="errors.changePasswordError" class="alert alert-danger">{{errors.changePasswordError}}</div>

    <b-form v-on:submit.prevent="changePassword">
      <b-form-group label="Existing password" label-for="existing-password" :invalid-feedback="errors.existingPassword" :state="!errors.existingPassword">
        <b-form-input type="password" id="existing-password" placeholder="Existing Password" name="existingPassword" v-model="passwordForm.existingPassword" :state="!errors.existingPassword && passwordForm.existingPassword" />
      </b-form-group>

      <b-form-group label="Password" label-for="password" :invalid-feedback="errors.password" :state="!errors.password">
        <b-form-input type="password" id="password" placeholder="Password" name="password" v-model="passwordForm.password" :state="!errors.password && passwordForm.password" />
      </b-form-group>

      <b-form-group label="Confirm password" label-for="password2" :invalid-feedback="errors.password2" :state="!errors.password2">
        <b-form-input type="password" id="password2" placeholder="Confirm Password" name="password2" v-model="passwordForm.password2" :state="!errors.password2 && passwordForm.password2" />
      </b-form-group>

      <b-button class="float-right" type="submit" variant="success">Change Password</b-button>
      <b-button class="float-right mr-2" @click.prevent="closeModal" variant="danger">Cancel</b-button>
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
  import toastr from 'toastr';

  export default {
    name: 'ChangePasswordModal',
    data: () => ({
      errors: {},
      passwordForm: {
        existingPassword: '',
        password: '',
        password2: ''
      },
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
        this.passwordForm = {
          existingPassword: '',
          password: '',
          password2: ''
        };
        this.errors = {};
      },
      changePassword (e) {
        const data = {
          existingPassword: e.target.elements.existingPassword.value,
          password: e.target.elements.password.value,
          password2: e.target.elements.password2.value
        };

        api.changePassword(data)
          .then(res => {
            toastr.success('Password changed successfully');
            this.$emit('password-changed');
            this.closeModal();
          })
          .catch(error => {
            this.showErrors(error.response);
          });
      },
      showErrors (response) {
        if (response && response.status === 400 && response.data.errors) {
          const newErrors = {};

          response.data.errors.forEach(error => {
            newErrors[error.param] = newErrors[error.param]
              ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
          });

          this.errors = newErrors;
          return;
        }

        if (response && response.status === 400 && response.data.error) {
          this.errors = {
            changePasswordError: response.data.error,
          };
        }
      },
    }
  };
</script>
