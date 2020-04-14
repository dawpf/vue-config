<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
  </div>
</template>

<script>
import { getMockData, getProxtData } from '@/api/home.js'

export default {
  name: 'Home',
  async created() {
    try {
      let res_mock = await getMockData()
      console.log('测试获取到的mock数据', res_mock)
    } catch (error) {}

    try {
      let res_proxy = await getProxtData({ id: 123 })
      console.log('代理获取到的数据为:', res_proxy)
    } catch (error) {}
  }
}
</script>
