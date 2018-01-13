<template>
  <div>
    <h1>Login</h1>

    <div class="error">{{errors.global}}</div>

    <form v-on:submit.prevent="onLogin">
      <label for="username">Username</label>
      <input id="username" placeholder="username" name="username">
      <div class="error">{{errors.username}}</div>

      <label for="password">Password</label>
      <input id="password" type="password" placeholder="Password" name="password">
      <div class="error">{{errors.password}}</div>

      <label for="otp">Two factor code (if enabled)</label>
      <input id="otp" placeholder="OTP" name="otp">
      <div class="error">{{errors.otp}}</div>

      <label for="rememberme">Remember me</label>
      <input id="rememberme" type="checkbox" name="rememberme">
      <div class="error">{{errors.rememberme}}</div>

      <br>
      <div id="g-recaptcha" data-sitekey="6LdWpj8UAAAAAE8wa82TL6Rd4o9qaVcV7lBinl-E"></div>
      <div class="error">{{errors['g-recaptcha-response']}}</div>

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import api from 'src/api';
import Fingerprint2 from 'fingerprintjs2';
import {loadRecaptcha} from 'src/helpers';

export default {
  name: 'Login',
  data: () => ({
    captchaId: null,
    errors: {},
    fingerprint: null
  }),
  created () {
    loadRecaptcha(this.checkForCaptcha.bind(this));
    this.setFingerPrint();
  },
  methods: {
    onLogin (e) {
      const data = {
        username: e.target.elements.username.value,
        password: e.target.elements.password.value,
        otp: e.target.elements.otp.value,
        rememberme: e.target.elements.rememberme.checked,
        fingerprint: this.fingerprint,
        'g-recaptcha-response': e.target.elements['g-recaptcha-response'] &&
          e.target.elements['g-recaptcha-response'].value
      };

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
