<template>
  <div>
    <b-table
      :per-page="perPage"
      :current-page="currentPage"
      :items="fetchSupportTickets"
      :fields="fields"
      :show-empty="true"
      ref="table"
      empty-text="You have not raised any support tickets"
      responsive striped small outlined hover>

      <template slot="status" slot-scope="row">
        <b-badge :variant="row.value === 'open' ? 'success' : 'danger'">
          {{row.value.toUpperCase()}}
        </b-badge>
      </template>

      <template slot="show_details" slot-scope="row">
        <b-button size="sm" variant="default" @click.stop="row.toggleDetails">
          {{ row.detailsShowing ? '-' : '+'}}
        </b-button>
      </template>

      <template slot="row-details" slot-scope="row">
        <b-row :no-gutters="true">
          <b-col cols="2">Message:</b-col>
          <b-col cols="10">{{ row.item.message }}</b-col>
        </b-row>

        <b-row :no-gutters="true" v-if="row.item.comment">
          <b-col cols="2">Comment:</b-col>
          <b-col cols="10">{{ row.item.comment }}</b-col>
        </b-row>
      </template>
    </b-table>

    <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" align="right" />
  </div>
</template>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bPagination from 'bootstrap-vue/es/components/pagination/pagination';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bBadge from 'bootstrap-vue/es/components/badge/badge';

  import moment from 'moment';
  import api from 'src/api';

  export default {
    name: 'SupportTickets',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      'b-table': bTable,
      'b-pagination': bPagination,
      'b-button': bButton,
      'b-badge': bBadge
    },
    data: () => ({
      perPage: 10,
      currentPage: 1,
      totalRows: 0,
      fields: [
        {key: 'show_details', label: '+'},
        {key: 'date', label: 'Date', formatter: 'formatDate'},
        'status',
        {key: 'message', label: 'Message', formatter: 'truncateMessage'}
      ]
    }),
    methods: {
      fetchSupportTickets (ctx) {
        const offset = (ctx.currentPage - 1) * ctx.perPage;
        return api.fetchSupportTickets(ctx.perPage, offset)
          .then(res => {
            if (res && res.data && Array.isArray(res.data.results)) {
              this.totalRows = parseInt(res.data.count, 10);
              return res.data.results;
            }
          })
          .catch(error => {
            console.error(error);
            return [];
          });
      },
      formatDate (ts) {
        return moment(ts).format('LLL');
      },
      truncateMessage (message) {
        if (message.length > 100) {
          return `${message.slice(0, 100)}...`;
        }

        return message;
      }
    }
  };
</script>
