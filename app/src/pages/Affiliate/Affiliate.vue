<template>
  <b-row>
    <b-col cols="12" offset="0" md="8" offset-md="2">
      <h2>Refer a friend</h2>
      <ReferAFriend />
    </b-col>

    <b-col cols="12" offset="0" md="8" offset-md="2">
      <br>
      <h2>Earnings Summary</h2>
      <AffiliateSummary :data="summary" />
    </b-col>

    <b-col cols="12" offset="0" md="8" offset-md="2">
      <br>
      <h2>Affiliate Users</h2>
      <AffiliateUsers :data="affiliateUsers" :perPage="perPage" />
    </b-col>
  </b-row>
</template>

<script>
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bPagination from 'bootstrap-vue/es/components/pagination/pagination';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import AffiliateUsers from './AffiliateUsers';
  import AffiliateSummary from './AffiliateSummary';
  import ReferAFriend from './ReferAFriend';
  import api from 'src/api';

  export default {
    name: 'Affiliate',
    components: {
      'b-table': bTable,
      'b-pagination': bPagination,
      'b-button': bButton,
      'b-row': bRow,
      'b-col': bCol,
      AffiliateUsers,
      AffiliateSummary,
      ReferAFriend
    },
    data: () => ({
      perPage: 10,
      isBusy: false,
      affiliateUsers: {},
      summary: []
    }),
    mounted () {
      this.getAffiliateSummary();
    },
    methods: {
      getAffiliateSummary () {
        api.getAffiliateSummary()
          .then(res => {
            this.summary = res.data.summary;
            this.affiliateUsers = res.data.affiliateUsers;
          });
      }
    }
  };
</script>
