const interviewSideBar = [
  {
    title: '前端面试',
    collapsable: false,
    children: [
      'js',
      'css',
      'code',
      'browser',
      'http',
      'vue',
      'safety',
      'webpack',
      'optimization',
      'algorithm',
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
    children: [
      'analysis',
      'other',
    ]
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
    title: '杂七杂八',
    collapsable: false,
    children: [
      'tools',
      'git',
      'node',
      'typescript',
      'snippets',
      'babel-plugin',
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