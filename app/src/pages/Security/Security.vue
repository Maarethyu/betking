<template>
  <div class="account-pages">
    <Sessions />
    <SetSecondFactorAuth />
    <WhiteListedIps />
    <LoginAttempts />
  </div>
</template>

<script>
  import Sessions from './Sessions';
  import SetSecondFactorAuth from './Set2fa';
  import WhiteListedIps from './WhiteListedIps';
  import LoginAttempts from './LoginAttempts';

  export default {
    name: 'Security',
    components: {
      Sessions,
      SetSecondFactorAuth,
      WhiteListedIps,
      LoginAttempts
    }
  };
</script>
