import BigNumber from 'bignumber.js';
import bus from './bus';

export const loadRecaptcha = function (onload) {
  window.onRecaptchaLoad = onload;

  const recaptchaScript = document.createElement('script');
  recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit');
  document.head.appendChild(recaptchaScript);
};

export const loadBootstrapTour = function (onload) {
  const tourScript = document.createElement('script');
  tourScript.setAttribute('src', '/static/js/bootstrap-tour-standalone.min.js');
  document.head.appendChild(tourScript);

  // const tourCss = document.createElement('link');
  // link.setAttribute()
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
  if (!x || parseFloat(x) === 0) {
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

export const toBigInt = function (value, scale) {
  return new BigNumber(value).times(new BigNumber(10).pow(scale))
          .toString();
};

export const getSecondFactorAuth = function () {
  return new Promise((resolve) => {
    if (this.is2faEnabled) {
      this.$root.$emit('bv::show::modal', 'validateSecondFactorAuthModal');

      bus.$once('authenticate-second-factor', (code) => {
        bus.$off('cancel-second-factor-auth');
        this.$root.$emit('bv::hide::modal', 'validateSecondFactorAuthModal');
        resolve(code);
      });

      bus.$once('cancel-second-factor-auth', () => {
        bus.$off('authenticate-second-factor');
        resolve(null);
      });
    } else {
      resolve(null);
    }
  });
};

export const getRandomAlphanumeric = (n) => {
  // should just use crypto random instead? This is from Stack overflow
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < n; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};
