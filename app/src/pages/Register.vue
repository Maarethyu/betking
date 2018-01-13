<template>
  <div>
  	<h1>Register</h1>

    <div class="error">{{errors.global}}</div>

    <form v-on:submit.prevent="onRegister">
      <label for="username">Username</label>
      <input id="username" placeholder="username" name="username">
      <div class="error">{{errors.username}}</div>

      <label for="email">Email</label>
      <input id="email" placeholder="email" name="email">
      <div class="error">{{errors.email}}</div>

      <label for="email">Password</label>
      <input id="password" type="password" placeholder="Password" name="password">
      <div class="error">{{errors.password}}</div>

      <label for="password2">Confirm Password</label>
      <input id="password2" type="password" placeholder="Confirm Password" name="password2">
      <div class="error">{{errors.password2}}</div>

      <br>
      <div id="g-recaptcha" data-sitekey="6LdWpj8UAAAAAE8wa82TL6Rd4o9qaVcV7lBinl-E"></div>
      <div class="error">{{errors['g-recaptcha-response']}}</div>

      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
import api from 'src/api';
import Fingerprint2 from 'fingerprintjs2';
import {loadRecaptcha} from 'src/helpers';

export default {
  name: 'Register',
  data: () => ({
    errors: {},
    fingerprint: null
  }),
  mounted () {
    this.showCaptcha();
    this.setFingerPrint();
  },
  methods: {
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
    setFingerPrint () {
      new Fingerprint2().get(fingerprint => { this.fingerprint = fingerprint; });
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
          global: response.data.error
        };
        return;
      }

      this.errors = {
        global: 'An unexpected error occured'
      };
    },
    showCaptcha () {
      loadRecaptcha(() => {
        window.grecaptcha.render('g-recaptcha');
      });
    }
  }
};
</script>
