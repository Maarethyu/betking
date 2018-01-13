<template>
  <div>
  	<h1>Whitelisted IPs</h1>

    <div class="error">{{ errors.ip }}</div>
    <div class="success">{{ message }}</div>

    <table>
      <thead>
        <tr>
          <th>IP</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ip, index) of ips" :key="index">
          <td>{{ip.ip_address}}</td>
          <td>
            <button v-on:click="deleteIp(ip.ip_address)">Delete</button>
          </td>
        </tr>
        <tr>
          <td><input id="ip" placeholder="IP" name="ip" v-model="newIp"></td>
          <td>
            <button v-on:click="addIp(newIp)">Add</button>
          </td>
        </tr>
        <tr>
          <td><button v-on:click="addIp()">Add Current Ip</button></td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
import api from 'src/api';

export default {
  name: 'WhitelistedIps',
  data: () => ({
    ips: [],
    message: '',
    errors: '',
    newIp: ''
  }),
  mounted () {
    this.getIps();
  },
  methods: {
    getIps () {
      api.getIps()
        .then(response => {
          this.ips = response.data.ips;
        })
        .catch(error => {
          this.showErrors(error.response);
        });
    },
    deleteIp (ip) {
      api.deleteIp(ip)
        .then(response => {
          this.getIps();
          this.message = 'Ip deleted successfully';
          this.errors = '';
        })
        .catch(error => {
          this.showErrors(error.response);
        });
    },
    addIp (ip) {
      api.addIp(ip)
        .then(response => {
          this.getIps();
          this.message = 'Ip added successfully';
          this.errors = '';
          this.newIp = '';
        })
        .catch(error => {
          this.showErrors(error.response);
        });
    },
    showErrors (response) {
      if (response && response.status === 400) {
        const newErrors = {};

        response.data.errors.forEach(error => {
          newErrors[error.param] = newErrors[error.param]
            ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
        });

        this.errors = newErrors;
        this.message = '';
      }
    }
  }
};
</script>