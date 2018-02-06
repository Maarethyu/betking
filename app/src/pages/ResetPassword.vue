<template>
  <AppShellMinimal>
    <b-row>
      <b-col cols="10" offset="1" md="4" offset-md="4">
        <h1>Reset Password</h1>

        <div class="alert alert-success" v-if="message">
          {{ message }}
          <router-link :to="'/'">Go to Dashboard</router-link>
        </div>

        <div v-if="errors.token" class="alert alert-danger">{{ errors.token }}</div>

        <b-form v-on:submit.prevent="resetPassword">
          <b-form-group label="Password" label-for="password" :invalid-feedback="errors.password" :state="!errors.password">
            <b-form-input id="password" type="password" placeholder="Password" name="password" v-model="form.password" :state="!errors.password && form.password" />
          </b-form-group>

          <b-form-group label="Confirm Password" label-for="password2" :invalid-feedback="errors.password2" :state="!errors.password2">
            <b-form-input id="password2" type="password" placeholder="Confirm Password" name="password2" v-model="form.password2" :state="!errors.password2 && form.password2" />
          </b-form-group>

          <b-button class="pull-right" variant="success" type="submit">Reset Password</b-button>
        </b-form>
      </b-col>
    </b-row>
  </AppShellMinimal>
</template>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bForm from 'bootstrap-vue/es/components/form/form';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bButton from 'bootstrap-vue/es/components/button/button';

  import api from 'src/api';
  import {getUrlParams} from 'src/helpers';
  import AppShellMinimal from 'components/AppShell/AppShellMinimal';

  export default {
    name: 'ResetPassword',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      'b-form': bForm,
      'b-form-group': bFormGroup,
      'b-form-input': bFormInput,
      'b-button': bButton,
      AppShellMinimal
    },
    data: () => ({
      token: '',
      message: '',
      errors: {},
      form: {
        password: '',
        password2: ''
      }
    }),
    mounted () {
      this.token = getUrlParams().token;
    },
    methods: {
      resetPassword () {
        const data = {
          token: this.token,
          password: this.form.password,
          password2: this.form.password2
        };

        api.resetPassword(data)
          .then(res => {
            this.message = res.data.message;
            this.errors = {};
            this.resetForm();
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
            }

            if (error.response && error.response.status === 409) {
              this.errors = {
                token: error.response.data.error
              };
            }

            this.message = '';
          });
      },
      resetForm () {
        this.form.password = '';
        this.form.password2 = '';
      }
    }
  };
</script>
