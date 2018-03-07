import axios from 'axios';
import store from 'src/store';
import {routeUserOnLogout} from 'src/router/route-helpers';

const csrfToken = () => {
  const el = document.getElementById('csrfToken');
  return el && el.value;
};

const errorHandler = function (error) {
  if (error.response && error.response.status === 401) {
    store.dispatch('resetStores');
    routeUserOnLogout();
  }

  throw error;
};

const get = function (uri, headers = {}) {
  return axios.get(uri, headers)
    .catch(errorHandler);
};

const post = function (uri, data = {}, newHeaders = {}) {
  const headers = {
    headers: Object.assign({}, {
      'csrf-token': csrfToken()
    }, newHeaders)
  };

  return axios.post(uri, data, headers)
    .catch(errorHandler);
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
  sendVerificationLink () {
    return post('/api/account/resend-verification-link');
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
  },
  getDepositAddress (currency) {
    return get(`/api/account/deposit-address?currency=${currency}`);
  },
  toggleEmailWithdrawalConfirmation (option, otp) {
    return post('/api/account/set-confirm-withdraw-by-email', {option, otp});
  },
  confirmWithdrawal (token) {
    return post('/api/confirm-withdraw', {token});
  },
  fetchWalletInfo (limit, skip, sort) {
    return get(`/api/account/wallet?limit=${limit}&skip=${skip}&sort=${sort}`);
  },
  fetchPendingWithdrawals (limit, skip, sort) {
    return get(`/api/account/pending-withdrawals?limit=${limit}&skip=${skip}&sort=${sort}`);
  },
  fetchWithdrawalHistory (limit, skip, sort) {
    return get(`/api/account/withdrawal-history?limit=${limit}&skip=${skip}&sort=${sort}`);
  },
  fetchDepositHistory (limit, skip, sort) {
    return get(`/api/account/deposit-history?limit=${limit}&skip=${skip}&sort=${sort}`);
  },
  fetchPendingDeposits (limit, skip, sort) {
    // TODO: Pending deposits from backend;
    return Promise.resolve({data: {results: [], count: 0}});
  },
  fetchWhitelistedAddresses () {
    return get('/api/account/whitelisted-address');
  },
  removeWhitelistedAddress (currency, otp) {
    return post('/api/account/whitelisted-address/remove', {currency, otp});
  },
  addWhitelistedAddress (currency, address, otp) {
    return post('/api/account/whitelisted-address/add', {currency, address, otp});
  },
  toggleStatsHidden (option) {
    return post('/api/account/toggle-stats-hidden', {option});
  },
  disableBetting () {
    return post('/api/account/disable-betting');
  },
  fetchBetStats () {
    return get('/api/stats/bets');
  },
  fetchSiteStats () {
    return get('/api/stats/all');
  },
  fetchExchangeRates () {
    return get('/api/stats/exchange-rates');
  },
  // Dice
  loadDiceState (clientSeed, currency) {
    return get(`/api/dice/load-state?clientSeed=${clientSeed}&currency=${currency}`);
  },
  diceBet (betAmount, currency, target, chance) {
    return post('/api/dice/bet', {betAmount, currency, target, chance});
  },
  setNewDiceClientSeed (clientSeed) {
    return post('/api/dice/set-client-seed', {clientSeed});
  },
  generateNewDiceSeed (clientSeed) {
    return post('/api/dice/generate-new-seed', {clientSeed});
  },
  fetchBetDetails (id) {
    return get(`/api/bets/bet-details?id=${id}`);
  },
  fetchUserStats (username) {
    return get(`/api/stats/user-stats?username=${username}`);
  },
  ignoreUser (username) {
    return post('/api/account/ignore-user', {username});
  },
  unIgnoreUser (username) {
    return post('/api/account/unignore-user', {username});
  },
  toggleDisplayHighrollersInChat (option) {
    return post('/api/account/toggle-display-highrollers-in-chat', {option});
  },
  fetchRecommendedFee () {
    return get('/api/recommended-btc-txn-fee');
  },
  sendTip (data) {
    return post('/api/account/send-tip', data);
  },
  getAffiliateSummary () {
    return get('/api/account/affiliate-summary');
  },
  getAffiliateUsers (limit, skip) {
    return get(`/api/account/affiliate-users?limit=${limit}&skip=${skip}`);
  },
  getAffiliateAmountDue (affiliateId) {
    return get(`/api/account/affiliate-amount-due?affiliateId=${affiliateId}`);
  }
};
