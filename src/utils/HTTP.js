import axios from 'axios'
import { getToken } from '@/utils/auth'

// 如果是代理环境，地址后面拼接上 /api
let isApi = ''
if (process.env.VUE_APP_MODE && process.env.VUE_APP_MODE === 'proxy') {
  isApi = '/api'
}

// axios 实例
const request = axios.create({
  baseURL: `${process.env.VUE_APP_URL}${isApi}`,  // 开发环境/生产环境/使用代理 切换
  withCredentials: true,  // 跨域请求时发送cookie
  timeout: 6000
})

// 请求拦截器
request.interceptors.request.use(
  config => {

    // config 中包含了所有的请求参数，可以在这里对请求参数进行处理，如：添加默认请求参数，扩展管理等

    // 添加 token
    if (getToken()) {
      config.headers['Authorization'] = getToken()
    }
    // 添加默认参数
    if (config.params) {
      config.params = {
        apikey: '123456798',
        ...config.params
      }
    }

    return config
  },
  error => {
    // do something with request error
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // const res = response.data

    // // if the custom code is not 20000, it is judged as an error.
    // if (res.code !== 20000) {
    //   Message({
    //     message: res.message || 'Error',
    //     type: 'error',
    //     duration: 5 * 1000
    //   })

    //   // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
    //   if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
    //     // to re-login
    //     MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
    //       confirmButtonText: 'Re-Login',
    //       cancelButtonText: 'Cancel',
    //       type: 'warning'
    //     }).then(() => {
    //       store.dispatch('user/resetToken').then(() => {
    //         location.reload()
    //       })
    //     })
    //   }
    //   return Promise.reject(new Error(res.message || 'Error'))
    // } else {
    //   return res
    // }
    return response.data
  },
  error => {
    const data = error.response.data
    const status = error.response.status

    // 对不同状态码进行管理
    if (status === 401) {
      console.log('登录已过期');
    } else if (status === 500) {
      console.log('服务器错误');
    }
    return Promise.reject(data.error)
  }
)

export default request

