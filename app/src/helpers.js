import BigNumber from 'bignumber.js';

export const loadRecaptcha = function (onload) {
  window.onRecaptchaLoad = onload;

  const recaptchaScript = document.createElement('script');
  recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit');
  document.head.appendChild(recaptchaScript);
};

export const getUrlParams = function () {
  const search = location.search.substring(1);
  return search
    ? JSON.parse(`{"${search.replace(/&/g, '","').replace(/=/g, '":"')}"}`,
      function (key, value) {
        return key === ''
          ? value
          : decodeURIComponent(value);
      })
    : {};
};

export const formatAmount = function (amount, scale) {
  return new BigNumber(amount).toFixed(scale, BigNumber.ROUND_DOWN);
};

export const addCommas = (x) => {
  if (parseFloat(x) === 0) {
    return 0;
  }

  const parts = x.toString().split('.');
  return `${parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}.${parts[1]}`;
};
