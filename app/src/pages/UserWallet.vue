<template>
  <div class="user-wallet">
  	<Balances />
    <!-- <Deposits /> -->
    <!-- <Withdrawals /> -->
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

export default {
  name: 'UserWallet',
  components: {
    Balances
  }
};
</script>
