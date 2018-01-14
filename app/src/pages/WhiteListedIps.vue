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
import {mapGetters} from 'vuex';

export default {
  name: 'WhitelistedIps',
  data: () => ({
    ips: [],
    message: '',
    errors: '',
    newIp: '',
    otp: '',
  }),
  mounted () {
    this.getWhitelistedIpAddresses();
  },
  computed: mapGetters({
    is2faEnabled: 'is2faEnabled'
  }),
  methods: {
    getWhitelistedIpAddresses () {
      api.getWhitelistedIpAddresses()
        .then(response => {
          this.ips = response.data.ips;
        })
        .catch(error => {
          this.showErrors(error.response);
        });
    },
    deleteIp (ip) {
      if (this.is2faEnabled) {
        // TODO: Write a proper vue component for modal
        this.otp = prompt('Enter the otp');
      }
      api.deleteIp(ip, this.otp)
        .then(response => {
          this.getWhitelistedIpAddresses();
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
          this.getWhitelistedIpAddresses();
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

        response.data.errors && response.data.errors.forEach(error => {
          newErrors[error.param] = newErrors[error.param]
            ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
        });

        if (response.data.error) {
          newErrors.ip = response.data.error;
        }

        this.errors = newErrors;
        this.message = '';
      }
    }
  }
};
</script>
