import axios from 'axios';

const get = function (uri, headers = {}) {
  return axios.get(uri, headers);
};

const post = function (uri, data = {}, headers = {}) {
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
  forgotPassword (data) {
    return post('/api/forgot-password', data);
  },
  resetPassword (data) {
    return post('/api/reset-password', data);
  }
};
