<template>
  <b-modal id="loginModal" ref="modal" hide-footer lazy @hide="onModalHide">
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Login</template>

    <div class="alert alert-danger" v-if="errors.global">{{errors.global}}</div>

    <b-form v-on:submit.prevent="onLogin">

      <b-form-group label="Login via" label-for="loginMethod" :invalid-feedback="errors.loginmethod"
        :state="!errors.loginmethod">
        <b-form-select name="loginmethod" id="loginmethod" v-model="usernameOrEmail">
          <option value="Username">Username</option>
          <option value="Email">Email</option>
        </b-form-select>
      </b-form-group>

      <b-form-group :label="usernameOrEmail" label-for="username" :invalid-feedback="errors.username || errors.email"
        :state="!errors.username || errors.email">
        <b-form-input id="username" :placeholder="usernameOrEmail" name="username" />
      </b-form-group>

      <b-form-group label="Password" label-for="password" :invalid-feedback="errors.password"
        :state="!errors.password">
        <b-form-input id="password" type="password" placeholder="Password" name="password" />
      </b-form-group>

      <b-form-group label="Two factor code (if enabled)" label-for="otp" :invalid-feedback="errors.otp"
        :state="!errors.otp">
        <b-form-input id="otp" placeholder="OTP" name="otp" />
      </b-form-group>

      <b-form-group :invalid-feedback="errors.rememberme" :state="!errors.rememberme">
        <b-form-checkbox id="rememberme" type="checkbox" name="rememberme">
          Remember me?
        </b-form-checkbox>
      </b-form-group>

      <b-form-group :invalid-feedback="errors['g-recaptcha-login']" :state="!errors['g-recaptcha-login']">
        <div id="g-recaptcha-login" :data-sitekey="captchaSiteKey"></div>
      </b-form-group>

      <button class="btn btn-success float-right" type="submit">Login</button>
      <button class="btn btn-danger float-right mr-2" @click.prevent="closeModal">Cancel</button>
      <button class="btn btn-primary" @click.prevent="openForgotPasswordModal">Forgot Password?</button>
    </b-form>
  </b-modal>
</template>

<script>
import bModal from 'components/modal/modal';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox';
import bFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group';
import vBModal from 'bootstrap-vue/es/directives/modal/modal';

import Cookies from 'js-cookie';
import api from 'src/api';
import {loadRecaptcha, getCaptchaSiteKey} from 'src/helpers';

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
  directives: {
    'b-modal': vBModal
  },
  data: () => ({
    captchaId: null,
    errors: {},
    usernameOrEmail: 'Username',
    captchaSiteKey: getCaptchaSiteKey()
  }),
  computed: {
    ...mapGetters({
      isAuthenticated: 'isAuthenticated',
      fingerprint: 'fingerprint'
    })
  },
  created () {
    loadRecaptcha(this.checkForCaptcha.bind(this));

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
    onModalHide () {
      this.errors = {};
      this.captchaId = null;
      this.usernameOrEmail = 'Username';
    },
    openForgotPasswordModal () {
      this.$root.$emit('bv::show::modal', 'forgotPasswordModal');
    },
    onLogin (e) {
      e.preventDefault();

      const data = {
        loginmethod: this.usernameOrEmail.toLowerCase(),
        password: e.target.elements.password.value,
        otp: e.target.elements.otp.value,
        rememberme: e.target.elements.rememberme.checked,
        fingerprint: this.fingerprint,
        'g-recaptcha-response': e.target.elements['g-recaptcha-response'] &&
          e.target.elements['g-recaptcha-response'].value
      };

      data[data.loginmethod] = e.target.elements.username.value;

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
          this.captchaId = window.grecaptcha.render('g-recaptcha-login');
        }
      }
    }
  }
};
</script>
