<template>
  <div>
    <LoginModal />
    <RegisterModal />
  </div>
</template>

<script>
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export default {
  name: 'CommonModals',
  components: {
    LoginModal,
    RegisterModal
  }
};
</script>
