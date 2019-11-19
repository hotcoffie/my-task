import Vue from 'vue';
import App from './App';
import {store} from './sotre';
import {router} from './router';

console.log(process.env.NODE_ENV)
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
