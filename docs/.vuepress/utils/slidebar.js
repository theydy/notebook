const interviewSideBar = [
  {
    title: '前端面试',
    collapsable: false,
    children: [
      'js',
      // 'css',
      'code',
      // 'browser',
      'http',
      // 'vue',
      // 'safety',
      // 'webpack',
      // 'algorithm',
    ]
  },
]

const webpackSidebar = [
  {
    title: 'Webpack',
    collapsable: false,
    children: []
  },
]

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

const otherSideBar = [
  {
    title: 'babel',
    collapsable: false,
    children: [
      'babel/babel-plugin',
    ],
  },
  // {
  //   title: 'snippets',
  //   collapsable: false,
  //   children: [
  //   ],
  // },
]

module.exports = {
  interviewSideBar,
  webpackSidebar,
  vueSidebar,
  reactSidebar,
  otherSideBar,
}