const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/peer-vue-calling/'
    : '/',
    pwa: {
      id: '/',
      scope: '/',
      assetsVersion: 'v1.0.0',
      themeColor: "#5853FF",
      msTileColor: "#5853FF",
      name: "Plug Talk",
      description: "Call your friends and share location",
      manifestOptions: {
        short_name: "Plug Talk",
        description: "Offline media player created by Jyrone Parker",
        start_url: '/',
        share_target: {
          action: "/",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            url: "link"
          }
        },     
        display_override: ["window-controls-overlay"],
        
        categories: ['multimedia', 'audio', 'video', 'entertainment', 'social'],
        
        orientation: 'any'
      }
    }
})
