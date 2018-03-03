<template>
  <div>
    <LoginModal />
    <RegisterModal />
    <WithdrawalModal />
    <DepositModal />
    <ForgotPasswordModal />
    <ValidateTwoFactorModal />
    <BetDetailsModal :id="betId" />
    <UserLookupModal :username="username" />
    <SendTipModal :username="tipUserName" />
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
import UserLookupModal from './UserLookupModal';
import SendTipModal from './SendTipModal';

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
    BetDetailsModal,
    UserLookupModal,
    SendTipModal
  },
  data: () => ({
    betId: null,
    username: null,
    tipUserName: ''
  }),
  mounted () {
    bus.$on('show-bet-details-modal', (id) => {
      this.betId = id;
      this.$root.$emit('bv::show::modal', 'betDetailsModal');
    });

    bus.$on('bet-details-modal-closed', () => {
      this.betId = null;
    });

    bus.$on('show-user-lookup-modal', (username) => {
      this.username = username;
      this.$root.$emit('bv::show::modal', 'userLookupModal');
    });

    bus.$on('user-lookup-modal-closed', () => {
      this.username = null;
    });

    bus.$on('show-send-tip-modal', (name) => {
      this.tipUserName = name;
      this.$root.$emit('bv::show::modal', 'sendTipModal');
    });

    this.$on('send-tip-modal-closed', () => {
      this.tipUserName = '';
    });
  }

};
</script>
