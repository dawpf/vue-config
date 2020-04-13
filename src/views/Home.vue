<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />

    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

import { getMockData_home, getProxtData } from '@/api/home.js'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  async created() {
    let res_mock = await getMockData_home() // 发起请求
    console.log('测试获取到的mock数据', res_mock)

    // let res_proxy = await getProxtData()
    // console.log('代理获取到的数据为:', res_proxy)
  }
}
</script>
