const { nav } = require('./utils/nav.js');
const { 
  interviewSideBar,
  webpackSidebar,
  vueSidebar,
  reactSidebar,
  otherSideBar,
 } = require('./utils/slidebar.js');

module.exports = {
  title: 'theydy',
  description: 'theydy 的个人博客',
  base: '/notebook/',
  head: [
    ['link', { rel: 'icon', href: '/icon.png' }]
  ],
  port: 3000,
  markdown: {
    lineNumbers: false
  },
  themeConfig: {
    lastUpdated: '最后更新时间',
    sidebar: 'auto',
    repo: 'https://github.com/theydy/notebook',
    repoLabel: 'Github',
    nav,
    sidebar: {
      '/interview/': interviewSideBar,
      '/webpack/': webpackSidebar,
      '/vue/': vueSidebar,
      '/react/': reactSidebar,
      '/other/': otherSideBar,
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@images': '../images',
        '@components': './components'
      }
    }
  }
}