<template>
  <div>
    <LoginModal />
    <RegisterModal />
    <WithdrawalModal />
    <DepositModal />
    <ForgotPasswordModal />
    <ValidateTwoFactorModal />
  </div>
</template>

<script>
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import WithdrawalModal from './WithdrawalModal';
import DepositModal from './DepositModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import ValidateTwoFactorModal from './ValidateTwoFactorModal';

export default {
  name: 'CommonModals',
  components: {
    LoginModal,
    RegisterModal,
    WithdrawalModal,
    DepositModal,
    ForgotPasswordModal,
    ValidateTwoFactorModal
  }
};
</script>
