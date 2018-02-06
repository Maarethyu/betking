<template>
  <b-modal id="forgotPasswordModal" ref="modal" hide-footer lazy @hide="onModalHide">
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Forgot Password</template>

    <div class="alert alert-success" v-if="message">{{message}}</div>

    <b-form  v-on:submit.prevent="forgotPassword">
      <b-form-group label="Email" label-for="forgot-password-email" :invalid-feedback="errors.email" :state="!errors.email">
        <b-form-input id="forgot-password-email" placeholder="Email" name="email" v-model="email" :state="!errors.email && email" />
      </b-form-group>

      <button class="btn btn-success pull-right" type="submit">Forgot Password</button>
      <button class="btn btn-danger pull-right mr-1" @click.prevent="closeModal">Cancel</button>
    </b-form>
  </b-modal>
</template>

<script>
import bModal from 'bootstrap-vue/es/components/modal/modal';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

import api from 'src/api';

export default {
  name: 'ForgotPasswordModal',
  components: {
    'b-modal': bModal,
    'b-form': bForm,
    'b-form-group': bFormGroup,
    'b-form-input': bFormInput
  },
  data: () => ({
    email: '',
    message: '',
    errors: {}
  }),
  methods: {
    closeModal () {
      this.$refs.modal && this.$refs.modal.hide();
    },
    onModalHide () {
      this.email = '';
      this.message = '';
      this.errors = {};
    },
    forgotPassword () {
      const data = {
        email: this.email
      };

      api.forgotPassword(data)
        .then(res => {
          this.message = res.data.message;
          this.errors = {};
          this.email = '';
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            const newErrors = {};

            error.response.data.errors.forEach(error => {
              newErrors[error.param] = newErrors[error.param]
                ? `${newErrors[error.param]} / ${error.msg}`
                : error.msg;
            });

            this.errors = newErrors;
            this.message = '';
          }
        });
    }
  }
};
</script>
