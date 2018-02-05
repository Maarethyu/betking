<template>
  <b-row>
    <b-col cols="10" offset="1">
      <h3>Balances</h3>
  	  <Balances />
    </b-col>

    <b-col cols="5" offset="1">
      <h3>Pending Withdrawals</h3>
  	  <PendingWithdrawals />
    </b-col>

    <b-col cols="5">
      <h3>Pending Deposits</h3>
  	  Coming soon
    </b-col>

    <b-col cols="5" offset="1">
      <h3>Withdrawal History</h3>
  	  <WithdrawalHistory />
    </b-col>

    <b-col cols="5">
      <h3>Deposit History</h3>
  	  <DepositHistory />
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

  export default {
    name: 'UserWallet',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      Balances,
      PendingWithdrawals,
      DepositHistory,
      WithdrawalHistory
    }
  };
</script>
