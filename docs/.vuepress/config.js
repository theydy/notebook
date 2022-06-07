const { nav } = require('./utils/nav.js');
const { 
  interviewSideBar,
  webpackSidebar,
  vueSidebar,
  reactSidebar,
  otherSideBar,
  engineeringSideBar,
 } = require('./utils/slidebar.js');

module.exports = {
  title: 'theydy',
  description: '读书笔记 + 知识整理',
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
      '/engineering/': engineeringSideBar,
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