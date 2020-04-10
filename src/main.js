import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

console.log('当前环境数据地址：', process.env);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
