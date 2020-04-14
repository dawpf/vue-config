
const path = require('path');

module.exports = {
  publicPath: '/', // 默认输出的路径 就是在当前地址栏后面添加的路径 若为 'ccc' 则为  http://localhost:8085/ccc/
  outputDir: process.env.NODE_ENV === "development" ? 'devdist' : 'dist', // 不同的环境打不同包名
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
    proxy: {
      '/api': {
        target: 'http://t.yushu.im',     // 如果使用代理，配置代理的数据库地址
        changeOrigin: true,              // 是否设置同源，输入是的
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