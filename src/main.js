import Vue from 'vue';
import App from './App';
import {store} from './sotre';
import {router} from './router';

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
