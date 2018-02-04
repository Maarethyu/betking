<template>
  <div>
    <LoginModal />
    <RegisterModal />
    <WithdrawalModal />
    <DepositModal />
  </div>
</template>

<script>
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import WithdrawalModal from './WithdrawalModal';
import DepositModal from './DepositModal';

export default {
  name: 'CommonModals',
  components: {
    LoginModal,
    RegisterModal,
    WithdrawalModal,
    DepositModal
  }
};
</script>
