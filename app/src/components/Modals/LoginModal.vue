<template>
  <b-modal id="loginModal" ref="modal" hide-footer lazy>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Login</template>

    <div class="error">{{errors.global}}</div>

    <b-form v-on:submit.prevent="onLogin">

      <b-form-group label="Login via" label-for="loginVia" :invalid-feedback="errors.loginvia"
        :state="errors.loginvia">
        <b-form-select name="loginvia" id="loginvia" v-model="usernameOrEmail">
          <option value="Username">Username</option>
          <option value="Email">Email</option>
        </b-form-select>
      </b-form-group>

      <b-form-group :label="usernameOrEmail" label-for="username" :invalid-feedback="errors.username || errors.email"
        :state="errors.username || errors.email">
        <b-form-input id="username" :placeholder="usernameOrEmail" name="username" />
      </b-form-group>

      <b-form-group label="Password" label-for="password" :invalid-feedback="errors.password"
        :state="errors.password">
        <b-form-input id="password" type="password" placeholder="Password" name="password" />
      </b-form-group>

      <b-form-group label="Two factor code (if enabled)" label-for="otp" :invalid-feedback="errors.otp"
        :state="errors.password">
        <b-form-input id="otp" placeholder="OTP" name="otp" />
      </b-form-group>

      <b-form-group :invalid-feedback="errors.rememberme" :state="errors.rememberme">
        <b-form-checkbox id="rememberme" type="checkbox" name="rememberme">
          Remember me?
        </b-form-checkbox>
      </b-form-group>

      <b-form-group>
        <div id="g-recaptcha" data-sitekey="6LdWpj8UAAAAAE8wa82TL6Rd4o9qaVcV7lBinl-E"></div>
      </b-form-group>

      <div class="submit-buttons">
        <button class="btn btn-success" type="submit">Login</button>
        <button class="btn btn-danger" @click.prevent="closeModal">Cancel</button>
      </div>

    </b-form>
  </b-modal>
</template>

<script>
import bModal from 'bootstrap-vue/es/components/modal/modal';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox';
import bFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group';

import Cookies from 'js-cookie';
import api from 'src/api';
import Fingerprint2 from 'fingerprintjs2';
import {loadRecaptcha} from 'src/helpers';

import {mapGetters} from 'vuex';

export default {
  name: 'LoginModal',
  components: {
    'b-modal': bModal,
    'b-form': bForm,
    'b-form-group': bFormGroup,
    'b-form-select': bFormSelect,
    'b-form-input': bFormInput,
    'b-form-checkbox': bFormCheckbox,
    'b-form-checkbox-group': bFormCheckboxGroup
  },
  data: () => ({
    captchaId: null,
    errors: {},
    fingerprint: null,
    usernameOrEmail: 'Username'
  }),
  computed: mapGetters({
    isAuthenticated: 'isAuthenticated'
  }),
  created () {
    loadRecaptcha(this.checkForCaptcha.bind(this));
    this.setFingerPrint();

    if (this.isAuthenticated) {
      this.closeModal();
    }
  },
  watch: {
    isAuthenticated (newValue) {
      if (newValue) {
        this.closeModal();
      }
    }
  },
  methods: {
    closeModal () {
      this.$refs.modal && this.$refs.modal.hide();
    },
    onLogin (e) {
      e.preventDefault();

      const data = {
        loginvia: this.usernameOrEmail.toLowerCase(),
        password: e.target.elements.password.value,
        otp: e.target.elements.otp.value,
        rememberme: e.target.elements.rememberme.checked,
        fingerprint: this.fingerprint,
        'g-recaptcha-response': e.target.elements['g-recaptcha-response'] &&
          e.target.elements['g-recaptcha-response'].value
      };

      data[data.loginvia] = e.target.elements.username.value;

      api.login(data)
        .then(res => {
          this.$store.dispatch('onLogin', res.data);
          this.$store.dispatch('fetchUser');
        })
        .catch(error => {
          this.checkForCaptcha();
          this.showErrors(error.response);
        });
    },
    setFingerPrint () {
      new Fingerprint2().get(fingerprint => { this.fingerprint = fingerprint; });
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
    checkForCaptcha () {
      const shouldDisplayCaptcha = Cookies.get('login_captcha') === 'yes';

      if (shouldDisplayCaptcha) {
        if (this.captchaId !== null) {
          window.grecaptcha.reset(this.captchaId);
        } else {
          this.captchaId = window.grecaptcha.render('g-recaptcha');
        }
      }
    }
  }
};
</script>
