<template>
  <b-modal id="registerModal" ref="modal" hide-footer lazy @shown="shown">
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Register</template>

    <div class="alert alert-danger" v-if="errors.global">{{errors.global}}</div>

    <b-form v-on:submit.prevent="onRegister">

      <b-form-group label="Username" label-for="username" :invalid-feedback="errors.username"
        :state="!errors.username">
        <b-form-input id="username" placeholder="username" name="username" required/>
      </b-form-group>

      <b-form-group label="email (optional)" label-for="email" :invalid-feedback="errors.email"
        :state="!errors.email">
        <b-form-input id="email" placeholder="email" name="email" />
      </b-form-group>

      <b-form-group label="Password" label-for="password" :invalid-feedback="errors.password"
        :state="!errors.password">
        <b-form-input id="password" type="password" placeholder="Password" name="password" required/>
      </b-form-group>

      <b-form-group label="Confirm Password" label-for="password2" :invalid-feedback="errors.password2"
        :state="!errors.password2">
        <b-form-input id="password2" type="password" placeholder="Confirm password" name="password2" required/>
      </b-form-group>

      <b-form-group :invalid-feedback="errors['g-recaptcha-response']" :state="!errors['g-recaptcha-response']">
        <div id="g-recaptcha-register" data-sitekey="6LdWpj8UAAAAAE8wa82TL6Rd4o9qaVcV7lBinl-E"></div>
      </b-form-group>

      <div class="submit-buttons">
        <button class="btn btn-success float-right" type="submit">Register</button>
        <button class="btn btn-danger float-right mr-2" @click.prevent="closeModal">Cancel</button>
      </div>

    </b-form>
  </b-modal>
</template>

<script>
import bModal from 'bootstrap-vue/es/components/modal/modal';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

import api from 'src/api';
import {loadRecaptcha} from 'src/helpers';

import {mapGetters} from 'vuex';

export default {
  name: 'registerModal',
  components: {
    'b-modal': bModal,
    'b-form': bForm,
    'b-form-group': bFormGroup,
    'b-form-input': bFormInput
  },
  data: () => ({
    errors: {}
  }),
  computed: {
    ...mapGetters({
      isAuthenticated: 'isAuthenticated',
      fingerprint: 'fingerprint'
    })
  },
  watch: {
    isAuthenticated (newValue) {
      if (newValue) {
        this.closeModal();
      }
    }
  },
  methods: {
    shown () {
      this.showCaptcha();
      if (this.isAuthenticated) {
        this.closeModal();
      }
    },
    closeModal () {
      this.$refs.modal && this.$refs.modal.hide();
    },
    onRegister (e) {
      const data = {
        username: e.target.elements.username.value,
        email: e.target.elements.email.value,
        password: e.target.elements.password.value,
        password2: e.target.elements.password2.value,
        fingerprint: this.fingerprint,
        'g-recaptcha-response': e.target.elements['g-recaptcha-response'] &&
          e.target.elements['g-recaptcha-response'].value
      };

      api.register(data)
        .then(res => {
          this.$store.dispatch('onLogin', res.data);
          this.$store.dispatch('fetchUser');
        })
        .catch(error => {
          this.showErrors(error.response);
        });
    },
    showErrors (response) {
      if (response && (response.status === 409 || response.status === 401)) {
        this.errors = {
          global: response.data.error
        };
        return;
      }

      if (response && response.status === 400) {
        const newErrors = {};

        response.data.errors.forEach(error => {
          newErrors[error.param] = newErrors[error.param]
            ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
        });

        this.errors = newErrors;
        return;
      }

      this.errors = {
        global: 'An unexpected error occured'
      };
    },
    showCaptcha () {
      loadRecaptcha(() => {
        window.grecaptcha.render('g-recaptcha-register');
      });
    }
  }
};
</script>
