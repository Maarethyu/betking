<template>
  <b-row>
    <b-col cols="10" offset="1">
      <h1>Login Attempts</h1>

      <b-table
        id="login-attempts-table"
        stacked="sm"
        :items="getLoginAttempts"
        :fields="fields"
        :no-provider-sorting="true"
        responsive striped small outlined hover>
      </b-table>
    </b-col>
  </b-row>
</template>

<script>
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import api from 'src/api';
  import parser from 'ua-parser-js';
  import moment from 'moment';

  export default {
    name: 'LoginAttempts',
    components: {
      'b-table': bTable,
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      loginAttempts: [],
      fields: [
        {key: 'created_at', label: 'Date', formatter: 'formatDate'},
        {key: 'user_agent', label: 'Device / OS', formatter: 'getDeviceAndOs'},
        'ip_address',
        'fingerprint',
        {
          key: 'is_success',
          label: 'Successful?',
          formatter: (value) => {
            return value ? 'yes' : 'no';
          }
        }
      ],
      message: '',
      errorMessage: ''
    }),
    methods: {
      getLoginAttempts () {
        return api.getLoginAttempts()
          .then(res => {
            return res.data.loginAttempts;
          })
          .catch(err => {
            console.error(err);
            return [];
          });
      },
      getDeviceAndOs (ua) {
        const browser = parser(ua).browser;
        const os = parser(ua).os;
        return `${browser.name} (${browser.version}) ${os.name}(${os.version})`;
      },
      formatDate (date) {
        return moment(date).format('LLL');
      }
    }
  };
</script>
