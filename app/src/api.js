import axios from 'axios';

const csrfToken = () => {
  const el = document.getElementById('csrfToken');
  return el && el.value;
};

const get = function (uri, headers = {}) {
  return axios.get(uri, headers);
};

const post = function (uri, data = {}, newHeaders = {}) {
  const headers = {
    headers: Object.assign({}, {
      'csrf-token': csrfToken()
    }, newHeaders)
  };

  return axios.post(uri, data, headers);
};

export default {
  fetchUser () {
    return get('/api/account/me');
  },
  login (data) {
    return post('/api/login', data);
  },
  logout () {
    return post('/api/account/logout');
  },
  fetchNew2faKey () {
    return get('/api/account/2fa-key');
  },
  enable2fa (otp) {
    return post('/api/account/enable-2fa', {otp});
  },
  disable2fa (otp) {
    return post('/api/account/disable-2fa', {otp});
  },
  forgotPassword (data) {
    return post('/api/forgot-password', data);
  },
  resetPassword (data) {
    return post('/api/reset-password', data);
  },
  register (data) {
    return post('/api/register', data);
  },
  getSessions () {
    return get('/api/account/active-sessions');
  },
  logoutOne (data) {
    return post('/api/account/logout-session', data);
  },
  logoutAll () {
    return post('/api/account/logout-all-sessions');
  },
  changeEmail (data) {
    return post('/api/account/change-email', data);
  },
  changePassword (data) {
    return post('/api/account/change-password', data);
  },
  getWhitelistedIpAddresses () {
    return get('/api/account/get-whitelisted-ips');
  },
  deleteIp (ip, otp) {
    return post('/api/account/remove-whitelisted-ip', {ip, otp});
  },
  addIp (ip) {
    return post('/api/account/add-whitelisted-ip', {ip});
  },
  getLoginAttempts () {
    return get('/api/account/get-login-attempts');
  },
  verifyEmail (data) {
    return post('/api/verify-email', data);
  },
  fetchCurrencies () {
    return get('/api/config/currencies');
  },
  fetchAllBalances () {
    return get('/api/account/balances');
  },
  withdrawCurrency (data) {
    return post('/api/account/withdraw', data);
  }
};
