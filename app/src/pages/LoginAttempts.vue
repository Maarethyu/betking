<template>
  <div>
  	<h1>Login Attempts</h1>

    <div class="error">{{ errorMessage }}</div>
    <div class="success">{{ message }}</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Time Stamp</th>
          <th>Browser</th>
          <th>Ip</th>
          <th>Finger Print</th>
          <th>OS</th>
          <th>Successful</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(attempt, index) of loginAttempts" :key="attempt.id">
          <td>{{index + 1}}</td>
          <td>{{formatDate(attempt.created_at)}}</td>
          <td>{{getDeviceFromUserAgentString(attempt.user_agent)}}</td>
          <td>{{attempt.ip_address}}</td>
          <td>{{attempt.fingerprint}}</td>
          <td>{{getOsFromUserAgentString(attempt.user_agent)}}</td>
          <td>{{attempt.is_success}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from 'src/api';
import parser from 'ua-parser-js';
import moment from 'moment';

export default {
  name: 'LoginAttempts',
  data: () => ({
    loginAttempts: [],
    message: '',
    errorMessage: ''
  }),
  mounted () {
    this.getLoginAttempts();
  },
  methods: {
    getLoginAttempts () {
      api.getLoginAttempts()
        .then(res => {
          this.loginAttempts = res.data.loginAttempts;
        })
        .catch(err => {
          this.errorMessage = err.msg;
        });
    },
    getDeviceFromUserAgentString (ua) {
      const browser = parser(ua).browser;
      return `${browser.name} (${browser.version})`;
    },
    getOsFromUserAgentString (ua) {
      const os = parser(ua).os;
      return `${os.name}(${os.version})`;
    },
    formatDate (date) {
      return moment(date).format('LLL');
    }
  }
};
</script>
