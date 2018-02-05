<template>
  <b-row>
    <b-col cols="8" offset="2">
  	  <h3>Sessions</h3>

      <br>

      <b-button variant="danger" v-on:click="logoutCurrent()">Logout Current</b-button>
      <b-button variant="danger" v-on:click="logoutAll()">Logout All</b-button>

      <br>
      <br>

      <b-table
        id="sessions-table"
        stacked="sm"
        :items="getSessions"
        :fields="fields"
        ref="table"
        :no-provider-sorting="true"
        responsive striped small outlined hover>

        <template slot="x"  slot-scope="row">
          <b-button v-if="!row.item.is_current" size="sm" variant="danger" @click="logoutOne(row.item.id)">Logout</b-button>
          <b-badge v-if="row.item.is_current" variant="success">Current</b-badge>
        </template>
      </b-table>
    </b-col>
  </b-row>
</template>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bBadge from 'bootstrap-vue/es/components/badge/badge';
  import api from 'src/api';
  import moment from 'moment';
  import toastr from 'toastr';

  export default {
    name: 'Sessions',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      'b-button': bButton,
      'b-table': bTable,
      'b-badge': bBadge
    },
    data: () => ({
      message: '',
      errors: '',
      fields: [
        'id',
        {key: 'created_at', label: 'Date', formatter: 'formatDate'},
        'x'
      ]
    }),
    mounted () {
      this.getSessions();
    },
    methods: {
      refreshTable () {
        this.$refs.table.refresh();
      },
      getSessions () {
        return api.getSessions()
          .then(response => {
            return response.data.sessions;
          });
      },
      logoutOne (id) {
        const data = {id};

        api.logoutOne(data)
          .then(response => {
            toastr.info('Session logged out');
            this.refreshTable();
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
