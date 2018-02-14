<template>
  <div>
    <LoginModal />
    <RegisterModal />
    <WithdrawalModal />
    <DepositModal />
    <ForgotPasswordModal />
    <ValidateTwoFactorModal />
    <BetDetailsModal :id="betId" />
  </div>
</template>

<script>
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import WithdrawalModal from './WithdrawalModal';
import DepositModal from './DepositModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import ValidateTwoFactorModal from './ValidateTwoFactorModal';
import BetDetailsModal from './BetDetailsModal';

import bus from 'src/bus';

export default {
  name: 'CommonModals',
  components: {
    LoginModal,
    RegisterModal,
    WithdrawalModal,
    DepositModal,
    ForgotPasswordModal,
    ValidateTwoFactorModal,
    BetDetailsModal
  },
  data: () => ({
    betId: null
  }),
  mounted () {
    bus.$on('show-bet-details-modal', (id) => {
      this.betId = id;
      this.$root.$emit('bv::show::modal', 'betDetailsModal');
    });

    bus.$on('bet-details-modal-closed', () => {
      this.betId = null;
    });
  }

};
</script>
