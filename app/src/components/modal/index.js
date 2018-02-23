/* eslint-disable */
import bModal from './modal';
import modalPlugin from 'bootstrap-vue/es/directives/modal';
import { registerComponents, vueUse } from 'bootstrap-vue/es/utils/plugins';

var components = {
  bModal: bModal
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
    Vue.use(modalPlugin);
  }
};

vueUse(VuePlugin);

export default VuePlugin;
