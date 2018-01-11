<template>
  <div>
  	<h1>Sessions</h1>

    <div class="error">{{ errors.id }}</div>
    <div class="success">{{ message }}</div>

    <button v-on:click="logoutCurrent()">Logout Current</button>
    <button v-on:click="logoutAll()">Logout All</button>

    <table>
      <thead>
        <tr>
          <th>Session Id</th>
          <th>Created At</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="session of sessions" :key="session.id">
          <td>{{session.id}}</td>
          <td>{{formatDate(session.created_at)}}</td>
          <td v-if="!session.is_current">
            <button v-on:click="logoutOne(session.id)">Logout</button>
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
import api from 'src/api';
import moment from 'moment';

export default {
  name: 'Sessions',
  data: () => ({
    sessions: [],
    message: '',
    errors: ''
  }),
  mounted () {
    this.getSessions();
  },
  methods: {
    getSessions () {
      api.getSessions()
        .then(response => {
          this.sessions = response.data.sessions;
        });
    },
    logoutOne (id) {
      const data = {id};

      api.logoutOne(data)
        .then(response => {
          this.message = 'Successfully logged out one session';
          this.error = '';
          this.getSessions();
        })
        .catch(error => {
          this.showErrors(error.response);
        });
    },
    logoutCurrent () {
      this.$store.dispatch('logout');
    },
    logoutAll () {
      this.$store.dispatch('logoutAll');
    },
    formatDate (date) {
      return moment(date).format('LLL');
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
    },
  }
};
</script>
