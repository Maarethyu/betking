<template>
  <b-container class="account-pages">
    <b-row>
      <b-col>
        <h5>Login Attempts</h5>
        <br />
        <b-table
          id="login-attempts-table"
          stacked="sm"
          head-variant="dark"
          :items="getLoginAttempts"
          :fields="fields"
          :no-provider-sorting="true"
          responsive small outlined hover>
        </b-table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import api from 'src/api';
  import parser from 'ua-parser-js';
  import moment from 'moment';

  export default {
    name: 'LoginAttempts',
    components: {
      'b-container': bContainer,
      'b-table': bTable,
      'b-row': bRow,
      'b-col': bCol
    },
    data: () => ({
      loginAttempts: [],
      fields: [
        {key: 'created_at', label: 'DATE', formatter: 'formatDate'},
        {key: 'user_agent', label: 'DEVICE / OS', formatter: 'getDeviceAndOs'},
        {key: 'ip_address', label: 'IP ADDRESS'},
        {key: 'fingerprint', label: 'FINGERPRINT'},
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
