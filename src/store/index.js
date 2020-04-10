import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    app_data: 100
  },
  mutations: {
    add_app_data(state, num) {
      state.app_data += num
    }
  },
  actions: {
    add_app_data_action(content, num) {
      content.commit('add_app_data', num)
    }
  },
  modules: {}
});
