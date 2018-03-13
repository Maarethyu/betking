import axios from 'axios';
import store from 'src/store';
import {routeUserOnLogout} from 'src/router/route-helpers';

const csrfToken = () => {
  return window.settings.csrfToken;
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
  login (data) {
    return post('/api/auth/login', data);
  },
  logout () {
    return post('/api/auth/logout');
  },
  forgotPassword (data) {
    return post('/api/auth/forgot-password', data);
  },
  resetPassword (data) {
    return post('/api/auth/reset-password', data);
  },
  register (data) {
    return post('/api/auth/register', data);
  },
  verifyEmail (data) {
    return post('/api/auth/verify-email', data);
  },
  fetchUser () {
    return get('/api/sessions/me');
  },
  getSessions () {
    return get('/api/sessions/active-sessions');
  },
  logoutOne (data) {
    return post('/api/sessions/logout-session', data);
  },
  logoutAll () {
    return post('/api/sessions/logout-all-sessions');
  },
  getLoginAttempts () {
    return get('/api/sessions/get-login-attempts');
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
  sendVerificationLink () {
    return post('/api/account/resend-verification-link');
  },
  fetchCurrencies () {
    return get('/api/wallet/currencies');
  },
  fetchAllBalances () {
    return get('/api/wallet/balances');
  },
  withdrawCurrency (data) {
    return post('/api/wallet/withdraw', data);
  },
  getDepositAddress (currency) {
    return get(`/api/wallet/deposit-address?currency=${currency}`);
  },
  toggleEmailWithdrawalConfirmation (option, otp) {
    return post('/api/wallet/set-confirm-withdraw-by-email', {option, otp});
  },
  confirmWithdrawal (token) {
    return post('/api/wallet/confirm-withdraw', {token});
  },
  fetchWalletInfo (limit, skip, sort) {
    return get(`/api/wallet/wallet-info?limit=${limit}&skip=${skip}&sort=${sort}`);
  },
  fetchPendingWithdrawals (limit, skip, sort) {
    return get(`/api/wallet/pending-withdrawals?limit=${limit}&skip=${skip}&sort=${sort}`);
  },
  fetchWithdrawalHistory (limit, skip, sort) {
    return get(`/api/wallet/withdrawal-history?limit=${limit}&skip=${skip}&sort=${sort}`);
  },
  fetchDepositHistory (limit, skip, sort) {
    return get(`/api/wallet/deposit-history?limit=${limit}&skip=${skip}&sort=${sort}`);
  },
  fetchPendingDeposits (limit, skip, sort) {
    // TODO: Pending deposits from backend;
    return Promise.resolve({data: {results: [], count: 0}});
  },
  fetchWhitelistedAddresses () {
    return get('/api/wallet/whitelisted-address');
  },
  removeWhitelistedAddress (currency, otp) {
    return post('/api/wallet/whitelisted-address/remove', {currency, otp});
  },
  addWhitelistedAddress (currency, address, otp) {
    return post('/api/wallet/whitelisted-address/add', {currency, address, otp});
  },
  fetchRecommendedFee () {
    return get('/api/wallet/recommended-btc-txn-fee');
  },
  sendTip (data) {
    return post('/api/wallet/send-tip', data);
  },
  toggleStatsHidden (option) {
    return post('/api/bets/toggle-stats-hidden', {option});
  },
  disableBetting () {
    return post('/api/bets/disable-betting');
  },
  fetchBetDetails (id) {
    return get(`/api/bets/bet-details?id=${id}`);
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
  fetchUserStats (username) {
    return get(`/api/stats/user-stats?username=${username}`);
  },
  ignoreUser (username) {
    return post('/api/chat/ignore-user', {username});
  },
  unIgnoreUser (username) {
    return post('/api/chat/unignore-user', {username});
  },
  toggleDisplayHighrollersInChat (option) {
    return post('/api/chat/toggle-display-highrollers-in-chat', {option});
  },
  raiseSupportTicket (name, email, message) {
    return post('/api/support/raise-ticket', {name, email, message});
  },
  fetchSupportTickets (limit, skip) {
    return get(`/api/support/tickets?limit=${limit}&skip=${skip}`);
  },
  getAffiliateSummary () {
    return get('/api/affiliate/summary');
  },
  getAffiliateUsers (limit, skip) {
    return get(`/api/affiliate/users?limit=${limit}&skip=${skip}`);
  },
  getAffiliateAmountDue (affiliateId) {
    return get(`/api/affiliate/amount-due?affiliateId=${affiliateId}`);
  }
};
