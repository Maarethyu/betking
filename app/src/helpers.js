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
