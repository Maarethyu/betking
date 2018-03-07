<template>
  <b-row>
    <b-col cols="10" offset="1">
      <h3>Balances</h3>
  	  <Balances />
    </b-col>

    <b-col cols="10" offset="1" md="5" offset-md="1">
      <h3>Pending Withdrawals</h3>
  	  <PendingWithdrawals :data="pendingWithdrawals" :perPage="perPage" />
    </b-col>

    <b-col cols="10" offset="1" md="5" offset-md="0">
      <h3>Pending Deposits</h3>
  	  <PendingDeposits :data="pendingDeposits" :perPage="perPage" />
    </b-col>

    <b-col cols="10" offset="1" md="5" offset-md="1">
      <h3>Withdrawal History</h3>
  	  <WithdrawalHistory :data="withdrawalHistory" :perPage="perPage" />
    </b-col>

    <b-col cols="10" offset="1" md="5" offset-md="0">
      <h3>Deposit History</h3>
  	  <DepositHistory :data="depositHistory" :perPage="perPage" />
    </b-col>

    <b-col cols="10" offset="1" md="5" offset-md="1">
      <h3>Withdrawal Whitelist</h3>
      <WithdrawalWhitelist :data="whitelistedAddresses" />
    </b-col>

    <b-col cols="10" offset="1" md="5" offset-md="0">
      <h3>Confirm Withdrawals by Email</h3>
      <ConfirmWithdrawalByEmail />
    </b-col>

  </b-row>
</template>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import Balances from './Balances';
  import PendingWithdrawals from './PendingWithdrawals';
  import WithdrawalHistory from './WithdrawalHistory';
  import DepositHistory from './DepositHistory';
  import PendingDeposits from './PendingDeposits';
  import WithdrawalWhitelist from './WithdrawalWhitelist';
  import ConfirmWithdrawalByEmail from './ConfirmWithdrawalByEmail';

  import api from 'src/api';

  export default {
    name: 'UserWallet',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      Balances,
      PendingWithdrawals,
      DepositHistory,
      WithdrawalHistory,
      PendingDeposits,
      WithdrawalWhitelist,
      ConfirmWithdrawalByEmail
    },
    data: () => ({
      pendingWithdrawals: {},
      withdrawalHistory: {},
      depositHistory: {},
      pendingDeposits: {},
      whitelistedAddresses: [],
      perPage: 10
    }),
    mounted () {
      this.fetchWalletInfo();
    },
    methods: {
      fetchWalletInfo () {
        api.fetchWalletInfo(this.perPage, 0, 'created_at')
          .then(res => {
            this.pendingWithdrawals = res.data.pendingWithdrawals;
            this.withdrawalHistory = res.data.withdrawalHistory;
            this.depositHistory = res.data.depositHistory;
            this.pendingDeposits = res.data.pendingDeposits;
            this.whitelistedAddresses = res.data.whitelistedAddresses;
          });
      }
    }
  };
</script>
