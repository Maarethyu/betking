<template>
  <b-container>
    <b-row>
      <b-col cols="12">
        <h3>Support</h3>
        <SupportForm />
      </b-col>

      <b-col cols="12" v-if="isAuthenticated">
        <br>
        <h3>Support Tickets</h3>
        <SupportTickets />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import {mapGetters} from 'vuex';

  import SupportForm from './SupportForm';
  import SupportTickets from './SupportTickets';

  export default {
    name: 'Support',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      'b-container': bContainer,
      SupportForm,
      SupportTickets
    },
    computed: mapGetters({
      isAuthenticated: 'isAuthenticated'
    })
  };
</script>
