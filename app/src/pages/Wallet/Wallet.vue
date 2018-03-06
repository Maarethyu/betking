<template>
  <b-container class="account-pages">
    <b-row>
      <b-col cols="12">
        <h5>Balances</h5>
        <Balances />
        <hr>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="12">
        <h5>Withdrawals</h5>
      </b-col>
      <b-col cols="12">
        <div class="table-title">Pending Withdrawals</div>
        <PendingWithdrawals />
        <header></header>
      </b-col>

      <b-col cols="12">
        <div class="table-title">Withdrawal History</div>
        <WithdrawalHistory />
      </b-col>

      <b-row>
        <b-col cols="12">
          <b-row class="align-center">
            <b-col cols="12" class="col-md-8">
              <div class="table-title">Withdrawal Whitelist</div>
              <WithdrawalWhitelist />
            </b-col>

            <b-col cols="12" class="col-md-4">
              <div class="table-title">Confirm Withdrawals by Email</div>
              <ConfirmWithdrawalByEmail />
            </b-col>
          </b-row>
          <hr>
        </b-col>
      </b-row>
    </b-row>

    <b-row>
      <b-col cols="12">
        <h5>Deposits</h5>
      </b-col>
      <b-col cols="12">
        <div class="table-title">Pending Deposits</div>
        <PendingDeposits />
      </b-col>

      <b-col cols="12">
        <div class="table-title">Deposit History</div>
        <DepositHistory />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';

  import Balances from './Balances';
  import PendingWithdrawals from './PendingWithdrawals';
  import WithdrawalHistory from './WithdrawalHistory';
  import DepositHistory from './DepositHistory';
  import PendingDeposits from './PendingDeposits';
  import WithdrawalWhitelist from './WithdrawalWhitelist';
  import ConfirmWithdrawalByEmail from './ConfirmWithdrawalByEmail';

  export default {
    name: 'UserWallet',
    components: {
      'b-container': bContainer,
      'b-row': bRow,
      'b-col': bCol,
      Balances,
      PendingWithdrawals,
      DepositHistory,
      WithdrawalHistory,
      PendingDeposits,
      WithdrawalWhitelist,
      ConfirmWithdrawalByEmail
    }
  };
</script>

<style lang="scss">
  .account-pages {
    .table-title {
      text-transform: uppercase;
      font-weight: 700;
    }
    .align-center {
      align-items: center;
      margin: 0;
    }
  }
</style>

