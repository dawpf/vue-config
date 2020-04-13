# 项目说明

```javascript
npm install
npm run serve
```

### 测试/生产 环境打包
```javascript
npm run dev
npm run build
```

## vue3.0环境变量配置

根据不同的指令：

```javascript
npm run serve // 搭建本地环境
npm run dev // 生成测试环境文件夹(可自定义为devdist)
npm run build // 生成生产环境文件夹(一般默认为dist)
```

### 思路：

1，创建修改相关配置文件（Ctrl + C V即可）

2，封装 axios（根据配置文件，首先判断当前环境，获取对应环境的数据库地址作为当前环境下的基础地址，**拼接到** axios 里面的 url ）

3，模块化开发

4，使用插件对代码进行测试判断环境配置是否成功

### 一 项目根目录新建配置文件

#### .env.development

```javascript
module.export = {
  VUE_APP_URL = https://www.easy-mock.com/mock/example_dev
}
注：数据库地址不能加引号或分号！！
```

#### .env.production

```javascript
module.export = {
  VUE_APP_URL = https://www.easy-mock.com/mock/example_pro
}
```

#### package.json指令配置

```javascript
"scripts": {
    "serve": "vue-cli-service serve", // 本地环境
    "build": "vue-cli-service build", // 生产环境
    "lint": "vue-cli-service lint",
    "dev": "vue-cli-service build --mode development" // 测试环境
  },
```

#### vue.config.js

```javascript
const path = require('path');

module.exports = {
  publicPath: '/', // 默认输出的路径 就是在当前地址栏后面添加的路径 若为 'ccc' 则为  http://localhost:8085/ccc/
  outputDir: process.env.NODE_ENV === "development" ? 'devdist' : 'dist', // 不同的环境打不同包名
  // css: {  // 一次配置，全局使用，这个scss 因为每个文件都要引入
  //   loaderOptions: {
  //     sass: {
  //       data: `@import "./src/assets/hotcss/px2rem.scss";`
  //     }
  //   }
  // },
  lintOnSave: false,  // 关闭eslint
  productionSourceMap: true,  // 生产环境下css 分离文件
  devServer: {   // 配置服务器
    port: 8085, // 端口
    open: true,
    https: false,
    overlay: {
      warnings: true,
      errors: true
    }
  },
  configureWebpack: {  // 覆盖webpack默认配置的都在这里
    resolve: {   // 配置解析别名
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@h': path.resolve(__dirname, './src/assets/hotcss'),
        '@s': path.resolve(__dirname, './src/assets/style'),
        '@i': path.resolve(__dirname, './src/assets/images'),
      }
    }
  }
}
```

此时我们就可以获取到当前的环境（ main.js ）

```javascript
console.log('当前环境数据地址：', process.env);
// 打印如下：
{
	VUE_APP_URL: "https://www.easy-mock.com/mock/example_dev", // 当前环境的数据库地址
  NODE_ENV: "development", // 当前环境
	BASE_URL: "/" // 默认输出路径 publicPath
}
```

### 二 封装axios

在src / utils / http.js 文件夹下 对axios进行二次封装

```javascript
import axios from 'axios'
import { getToken } from '@/utils/auth'

// create an axios instance
const request = axios.create({
  // baseURL: process.env.VUE_APP_URL,
  // 测试mock用地址
  baseURL: 'https://easy-mock.bookset.io/mock/5e90379d00bfc566e5bb1acb/example',
  
  // 测试代理跨域用地址
  // baseURL: process.env.NODE_ENV === "development" ? '' : process.env.VUE_APP_URL,
  // withCredentials: true,  // 跨域请求时发送cookie
  timeout: 60000
})

const TOKEN = getToken()  // 获取token

// 请求拦截器
request.interceptors.request.use(
  config => {
    if (TOKEN) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = TOKEN
    }

    // 扩展管理--expands:[]
    if (config.params && config.params.expandList) {
      const expandList = config.params.expandList
      const expands = {}
      if (expandList && expandList.length) {
        expandList.map((item, index) => {
          expands[`expands[${index}]`] = item
        })
        config.params = {
          ...config.params,
          ...expands
        }
      }
      delete config.params.expandList
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


```

### 三 模块化开发

新建src / api / home.js（针对 home 模块的请求方法）

```javascript
import $HTTP from "@/utils/HTTP.js"
import Service from "@/utils/service.js" // 个人习惯把请求地址模块化统一管理

export function getMockData_home() {
  return $HTTP.get(Service.mock_home) // 等同于$HTTP.get('/home_url')
}

export function postMockData_home(param) {
  return $HTTP.post(Service.mock_home,param)
}

```

src / utils / service.js

```javascript
export default {
  mock: '/my_url',
  mock_home: '/home_url'
}
```

在home组件里面就可以调用 getMockData_home 方法来获取数据了

```html
<script>
import { getMockData_home , postMockData_home } from '@/api/home.js'

export default {
  name: 'Home',
  async created() {
    let res_get = await getMockData_home()
    // console.log(res_get)
    let res_post = await postMockData_home({
      id:123,
      name:'zhangsan',
      ...
    })
    // console.log(res.post)
  }
}
</script>
```

### 四 代码测试

```javascript
npm i serve -g // 全局安装 serve
npm run dev // 生成测试环境代码（根据vue.config.js配置，项目根目录会出现一个devdist文件夹）
serve devdist // 模拟线上服务器，在本地新建服务器并运行代码
```

调试工具中 : Request URL: 

*https://www.easy-mock.com/mock/example_dev/mock*

测试环境配置已完成，devdist 文件夹上传至测试环境服务器即可

生产环境同理（生产环境文件夹默认为 dist ）

## 服务器代理解决跨域问题

### 思路：

我们想要访问的目标接口地址是 http://t.yushu.im/v2/movie/in_theaters
现在，我们把这串地址的 http://t.yushu.im 这部分用拦截器 /api 替代，也就是说，当服务器启动的时候，在文件中读取到 ‘ /api ’ 这串字符串的时候，会变成 http:localhost/8080/api/v2/movie/in_theaters，而此时路径重写设置为忽略拦截器的名字，也就是说不包含拦截器的名字，因此，访问路径会变成这样，是这样 http:localhost/8080/v2/movie/in_theaters，最后，路径就成功伪装，顺利闯过了浏览器的关卡，就可以正常获取到数据

### Vue.config.js

```javascript
const path = require('path');

module.exports = {
  publicPath: '/', // 默认输出的路径 就是在当前地址栏后面添加的路径 若为 'ccc' 则为  http://localhost:8085/ccc/
  outputDir: process.env.NODE_ENV === "development" ? 'devdist' : 'dist', // 不同的环境打不同包名
  lintOnSave: false,  // 关闭eslint
  productionSourceMap: true,  // 生产环境下css 分离文件
  devServer: {   // 配置服务器
    port: 8085, // 端口
    open: true,
    https: false,
    overlay: {
      warnings: true,
      errors: true
    },
    proxy: {                             // 使用本地服务器代理解决跨域问题
      '/api': {
        //代理的目标地址，demo 要访问的数据为:http://t.yushu.im/v2/movie/in_theaters
        target: 'http://t.yushu.im',     
        changeOrigin: true,              //是否设置同源，输入是的
        pathRewrite: {                   //路径重写
          '/api': ''                     //选择忽略拦截器里面的单词
        }
      }
    }
  },
  configureWebpack: {  // 覆盖webpack默认配置的都在这里
    resolve: {   // 配置解析别名
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@h': path.resolve(__dirname, './src/assets/hotcss'),
        '@s': path.resolve(__dirname, './src/assets/style'),
        '@i': path.resolve(__dirname, './src/assets/images'),
      }
    }
  }
}
```

home.js 中使用

```javascript
import $HTTP from "@/utils/HTTP.js"
import Service from "@/utils/service.js" // 个人习惯把请求地址模块化统一管理

export function getMockData_home() {
  return $HTTP.get(Service.mock) // 等同于$HTTP.get('/home_url')
}

export function getProxyData() {
  return $HTTP.get('/api/v2/movie/in_theaters')
}
```

此时，就可以通过调用 getProxyData 获取到 http://t.yushu.im/v2/movie/in_theaters 地址里面的数据

### 注意

HTTP.js 中，开发环境下的数据库地址需要改为 ' '

```javascript
const request = axios.create({
  // baseURL: process.env.VUE_APP_URL,
  baseURL: process.env.NODE_ENV === "development" ? '' : process.env.VUE_APP_URL,
  withCredentials: true,  // 跨域请求时发送cookie
  timeout: 60000
})
```

**总结：当后端数据库已经配置好，前端不需要进行代理配置，按照  开发环境 / 生产环境  配置响应的 baseUrl 即可，如果后端不支持跨域，则前端在本地环境进行数据获取的时候需要进行代理配置**



