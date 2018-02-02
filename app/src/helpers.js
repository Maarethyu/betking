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

export const formatAmount = function (amount, value) {
  /* This helper should be added in component.methods
    The component must map "currencies" getter from store in component.computed
    */
  const currency = this.currencies.find(c => c.value === value);

  if (!currency) {
    return null;
  }

  return new BigNumber(amount).toFixed(currency.scale, BigNumber.ROUND_DOWN);
};

export const formatBigAmount = function (amount, value) {
  /* This helper should be added in component.methods
    The component must map "currencies" getter from store in component.computed
    */
  const currency = this.currencies.find(c => c.value === value);

  if (!currency) {
    return null;
  }

  return new BigNumber(amount).div(new BigNumber(10).pow(currency.scale))
  .toFixed(currency.scale, BigNumber.ROUND_DOWN);
};

export const addCommas = (x) => {
  if (parseFloat(x) === 0) {
    return '0.00000000';
  }

  const parts = x.toString().split('.');
  return `${parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}.${parts[1]}`;
};

export const formatCurrency = function (value, key) {
  let field = key;
  if (!key) {
    field = 'symbol';
  }

  /* This helper should be added in component.methods
    The component must map "currencies" getter from store in component.computed
    */
  const currency = this.currencies.find(c => c.value === value);

  if (!currency) {
    return null;
  }

  return currency[field];
};
