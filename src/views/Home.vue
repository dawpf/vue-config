<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <div>
      <button style="border:1px solid #000" @click="btnClick">点击增加20</button>
    </div>
    <div>
      <button style="border:1px solid #000" @click="btnClick1">点击增加30</button>
    </div>
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

import { getMockData_home } from '@/api/home.js'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  async created() {
    let res = await getMockData_home() // 发起请求
    console.log('获取到的请求回来的数据为:', res)
  },
  methods: {
    btnClick() {
      this.$store.commit('add_app_data', 20)
    },
    btnClick1() {
      this.$store.dispatch('add_app_data_action', 30)
    }
  }
}
</script>
