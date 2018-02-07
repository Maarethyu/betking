<template>
  <div>
    <Sessions />
    <br />
    <SetSecondFactorAuth />
    <br />
    <WhitelistedIps />
    <br />
    <LoginAttempts />
  </div>
</template>

<script>
  import Sessions from './Sessions';
  import SetSecondFactorAuth from './Set2fa';
  import WhitelistedIps from './WhitelistedIps';
  import LoginAttempts from './LoginAttempts';

  export default {
    name: 'Security',
    components: {
      Sessions,
      SetSecondFactorAuth,
      WhitelistedIps,
      LoginAttempts
    }
  };
</script>
