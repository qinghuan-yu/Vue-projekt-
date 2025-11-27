const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 设置静态资源路径为相对路径
  publicPath: './',
});