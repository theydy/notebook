const interviewSideBar = {
  title: '前端面试',
  collapsable: false,
  children: [
    '/interview/',
    '/interview/js.md',
    // '/interview/css/css.md',
    '/interview/code.md',
    // '/interview/browser/browser.md',
    // '/interview/http/http.md',
    // '/interview/vue/vue.md',
    // '/interview/safety/safety.md',
    // '/interview/webpack/webpack.md',
    // '/interview/algorithm/algorithm.md',
  ]
}

const webpackSidebar = {
  title: 'Webpack',
  collapsable: false,
  children: []
}

const vueSidebar = [
  {
    title: 'vue',
    collapsable: false,
    children: []
  },
]

const reactSidebar = [
  {
    title: 'react',
    collapsable: false,
    children: []
  },
]

module.exports = {
  interviewSideBar,
  webpackSidebar,
  vueSidebar,
  reactSidebar
}