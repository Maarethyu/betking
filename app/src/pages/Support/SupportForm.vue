<template>
  <b-container>
    <b-row align-h="center">
      <b-col cols="12">
        <div class="alert alert-success" v-if="ticketId">
          Your support ticket number is {{ticketId}}.
          You can use this number for further correspondence.<br>
          You will soon receive ticket status via email.
        </div>
      </b-col>
      <b-col cols="12" md="6">
        <b-form v-on:submit.prevent="onSubmit">
            <b-form-group label="Name" label-for="name" :invalid-feedback="errors.name" :state="!errors.name">
              <b-form-input type="text"
                id="name"
                placeholder="Name"
                name="name"
                v-model="name"
                autocomplete="off"
                :state="errors.name"/>
            </b-form-group>

            <b-form-group label="Email" label-for="email" :invalid-feedback="errors.email" :state="!errors.email">
              <b-form-input type="text"
                id="email"
                placeholder="Email"
                name="email"
                autocomplete="off"
                v-model="email" />
            </b-form-group>

            <b-form-group label="Message" label-for="message" :invalid-feedback="errors.message" :state="!errors.message">
              <b-form-textarea id="message"
                v-model="message"
                placeholder="Message"
                :rows="3"
                :max-rows="6" />
            </b-form-group>

            <button class="btn btn-success pull-right" type="submit">Submit</button>
          </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import bForm from 'bootstrap-vue/es/components/form/form';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bFormTextarea from 'bootstrap-vue/es/components/form-textarea/form-textarea';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import api from 'src/api';

  import {mapGetters} from 'vuex';

  export default {
    name: 'SupportForm',
    components: {
      'b-form': bForm,
      'b-form-group': bFormGroup,
      'b-form-input': bFormInput,
      'b-container': bContainer,
      'b-form-textarea': bFormTextarea,
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      name: '',
      email: '',
      message: '',
      ticketId: null,
      errors: {}
    }),
    computed: mapGetters({
      'isAuthenticated': 'isAuthenticated',
      'profile': 'profile'
    }),
    mounted () {
      if (this.isAuthenticated) {
        this.name = this.profile.username;
        this.email = this.profile.email;
      }
    },
    methods: {
      onSubmit () {
        api.raiseSupportTicket(this.name, this.email, this.message)
          .then((res) => {
            this.ticketId = res.data.ticketId;
            this.resetForm();
          })
          .catch(err => {
            if (err.response) {
              this.buildErrors(err.response);
              return;
            }

            throw err;
          });
      },
      buildErrors (response) {
        if (response && response.status === 400) {
          if (response.data.errors) {
            const newErrors = {};

            response.data.errors.forEach(error => {
              newErrors[error.param] = newErrors[error.param]
                ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
            });

            this.errors = newErrors;
          }
        }
      },
      resetForm () {
        this.name = '';
        this.email = '';
        this.message = '';
        this.errors = {};
      }
    }
  };
</script>
