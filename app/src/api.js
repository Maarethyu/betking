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
  fetchNew2faKey () {
    return get('/api/account/2fa-key');
  },
  enable2fa (otp) {
    return post('/api/account/enable-2fa', {otp});
  },
  disable2fa (otp) {
    return post('/api/account/disable-2fa', {otp});
  }
};
