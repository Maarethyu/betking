<template>
  <b-container>
    <b-row>
      <b-col>
        <h5 class="mt-35">Sessions</h5>

        <b-table
          id="sessions-table"
          stacked="sm"
          :items="getSessions"
          :fields="fields"
          ref="table"
          head-variant="dark"
          :no-provider-sorting="true"
          responsive small outlined hover>

          <template slot="x"  slot-scope="row">
            <b-button v-if="!row.item.is_current" size="sm" variant="danger" class="accounts-btn" @click="logoutOne(row.item.id)">Logout</b-button>
            <b-badge v-if="row.item.is_current" variant="success" class="status-badge" >Current</b-badge>
          </template>
        </b-table>
        <b-button variant="danger" class="accounts-btn" v-on:click="logoutCurrent()">Logout Current</b-button>
        <b-button variant="danger" class="accounts-btn" v-on:click="logoutAll()">Logout All</b-button>
        <hr>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
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
      'b-container': bContainer,
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
        {key: 'id', label: 'ID'},
        {key: 'created_at', label: 'DATE', formatter: 'formatDate'},
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
            toastr.success('Session logged out');
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

<style lang="scss">
  #sessions-table {
    .status-badge {
      height: 20px;
      padding: 5px 12px;
      line-height: 1;
      font-size: 10px;
      border-radius: 4px;
      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.5);
      text-shadow: 0 -1px rgba(0, 0, 0, 0.33);
    }
  }
</style>
