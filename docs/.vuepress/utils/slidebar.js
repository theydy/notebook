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
      'react',
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
    children: [
      '4',
      '5',
      'webpack-typescript',
    ]
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
    children: [
      'setup',
      'analysis',
    ]
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
      'mic',
      'vite',
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

const engineeringSideBar = [
  {
    title: '工程化',
    collapsable: false,
    children: [
      'package-json',
    ],
  },
]

module.exports = {
  interviewSideBar,
  webpackSidebar,
  vueSidebar,
  reactSidebar,
  otherSideBar,
  engineeringSideBar,
}