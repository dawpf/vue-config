# 项目说明

```javascript
npm install

npm run serve  // 开发环境
npm run proxy  // 开发环境下使用服务器代理请求数据
npm run dev    // 开发环境打包
npm run build  // 生产环境打包
```

## vue3.0环境变量配置

根据不同的指令：

```javascript
npm run serve  // 搭建本地环境
npm run dev    // 生成测试环境文件夹(可自定义为devdist)
npm run build  // 生成生产环境文件夹(一般默认为dist)
npm run proxy  // 搭建本地环境，且使用代理服务器请求数据
```

### 思路：

1，创建修改相关配置文件（Ctrl + C V即可）

2，封装 axios（根据配置文件，首先判断当前环境，获取对应环境的数据库地址作为当前环境下的基础地址，**拼接到** axios 里面的 url ）

3，模块化开发

4，使用插件对代码进行测试判断环境配置是否成功

### 一 项目根目录新建配置文件

#### 说明:

在vue-cli3中可以在根目录（与package.json同级）中创建以下四种类型的环境变量文件：

其中 指定模式的优先级较高

```markdown
.env                # 在所有的环境中被载入
.env.local          # 在所有的环境中被载入，但会被 git 忽略
.env.[mode]         # 只在指定的模式中被载入
.env.[mode].local   # 只在指定的模式中被载入，但会被 git 忽略
```

所配置的变量中只有以`VUE_APP_`开头的变量才会被webpack.DefinePlugin静态嵌入到客户端侧包中，如`VUE_APP_MODE`

被载入和变量将会对vue-cli-service的所有命令、插件和依赖可用。在应用代码中通过`process.env.[变量名]`进行访问

#### .env.development

```markdown
VUE_APP_URL = https://www.easy-mock.com/mock/example_dev
VUE_APP_MODE = 'development'
注：数据库地址不能加引号或分号！！
```

#### .env.production

```markdown
VUE_APP_URL = https://www.easy-mock.com/mock/example_pro
VUE_APP_MODE = 'production'
```

#### .env.proxy（自定义的proxy开发模式）

```markdown
VUE_APP_URL = ''
VUE_APP_MODE = 'proxy'
注:使用服务器代理时，VUE_APP_URL 需要为空，请求时变为  本地服务器/api/路径 http://localhost:8080/api/v2/movie/in_theaters，这样能绕过浏览器的同源策略，使用本地服务器请求数据
```

#### package.json指令配置

```javascript
"scripts": {
    "serve": "vue-cli-service serve", // 开发环境
     // 开发环境下使用代理服务器,需创建 .env.proxy 配置文件
  	"proxy": "vue-cli-service serve --mode proxy"  
  	"dev": "vue-cli-service build --mode development" // 开发环境打包
    "build": "vue-cli-service build", // 生产环境打包
    "lint": "vue-cli-service lint",
  },
```

#### vue.config.js

```javascript
const path = require('path');

module.exports = {
  // 默认输出的路径 就是在当前地址栏后面添加的路径 若为 'ccc' ，则为 http://localhost:8085/ccc/
  publicPath: '/'
  // 不同的环境打不同包名
  outputDir: process.env.NODE_ENV === "development" ? 'devdist' : 'dist', 
  lintOnSave: false,  // 关闭eslint
  productionSourceMap: true,  // 生产环境下css 分离文件
  devServer: {   // 配置服务器
    port: 8086,
    open: true,
    https: false,
    overlay: {
      warnings: true,
      errors: true
    },
    proxy: {  // 服务器代理相关
      '/api': {
        target: 'http://t.yushu.im',     // 如果使用代理，配置代理的数据库地址
        changeOrigin: true,              // 是否设置同源
        pathRewrite: {                   // 路径重写
          '^/api': ''                    // 选择忽略拦截器里面的单词
        }
      }
    }
  },
  configureWebpack: {  // 覆盖webpack默认配置的都在这里
    resolve: {   // 配置解析别名其中:@代表根目录，@c代表 src/components 文件夹，等
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@a': path.resolve(__dirname, './src/assets'),
        '@c': path.resolve(__dirname, './src/components'),
        '@u': path.resolve(__dirname, './src/utils'),
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
  VUE_APP_MODE: "development",  // .env.development 中的配置
  NODE_ENV: "development", // 当前环境
	BASE_URL: "/" // 默认输出路径 publicPath
}
```

### 二 封装axios

在src / utils / http.js 文件夹下 对axios进行二次封装

```javascript
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
```

其中 src / utils / auth.js 文件

```javascript
import Cookies from 'js-cookie'

const TokenKey = 'demo_pc_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
```

### 三 模块化开发

新建src / api / home.js（针对 home 模块的请求方法）

```javascript
import $HTTP from "@u/HTTP.js"
import Service from "@u/service.js"

export function getMockData() {
  return $HTTP.get(Service.mock)
}

export function getProxtData(params) {
  return $HTTP.get(Service.proxy, { params })
}
```

src / utils / service.js

```javascript
export default {
  mock: '/mock',
  proxy: '/v2/movie/in_theaters'
}
```

在home组件里面就可以调用 getMockData, getProxtData 方法来获取数据了

```html
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
```

### 四 代码测试

```javascript
npm i serve -g // 全局安装 serve
npm run dev    // 生成测试环境代码（根据vue.config.js配置，项目根目录会出现一个devdist文件夹）
serve devdist  // 模拟线上服务器，在本地新建服务器并运行代码
```

调试工具中 : Request URL: *https://www.easy-mock.com/mock/example_dev/mock*

测试环境配置已完成，devdist 文件夹上传至测试环境服务器即可

生产环境同理（生产环境文件夹默认为 dist ）

### 五 服务器代理解决跨域问题说明

我们想要访问的目标接口地址是 http://t.yushu.im/v2/movie/in_theaters
现在，我们把这串地址的 http://t.yushu.im 这部分用拦截器 /api 替代，也就是说，当服务器启动的时候，在文件中读取到 ‘ /api ’ 这串字符串的时候，会变成 http:localhost/8080/api/v2/movie/in_theaters，而此时路径重写设置为忽略拦截器的名字，也就是说不包含拦截器的名字，因此，访问路径会变成这样，是这样 http:localhost/8080/v2/movie/in_theaters，最后，路径就成功伪装，顺利闯过了浏览器的关卡，就可以正常获取到数据

**总结：当后端数据库已经配置好，前端不需要进行代理配置，按照  开发环境 / 生产环境  配置响应的 baseUrl 即可，如果后端不支持跨域，则前端在本地环境进行数据获取的时候需要进行代理配置**



