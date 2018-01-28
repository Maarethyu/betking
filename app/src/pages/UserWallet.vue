<template>
  <div class="user-wallet">
  	<Balances />
    <PendingWithdrawals />
    <WithdrawalHistory />
    <DepositHistory />
	</div>
</template>

<style>
  .user-wallet table, .user-wallet th, .user-wallet td {
    border: 1px solid rgba(206, 204, 204, 0.509);
    border-collapse: collapse;
    padding: 2px 8px;
  }

  .user-wallet .numeric {
    text-align: right;
  }
</style>

<script>
import Balances from 'components/Balances';
import PendingWithdrawals from 'components/PendingWithdrawals';
import WithdrawalHistory from 'components/WithdrawalHistory';
import DepositHistory from 'components/DepositHistory';

export default {
  name: 'UserWallet',
  components: {
    Balances,
    PendingWithdrawals,
    WithdrawalHistory,
    DepositHistory
  }
};
</script>
