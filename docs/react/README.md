# react

- [react 官方文档](https://zh-hans.reactjs.org/docs/getting-started.html)
- [react 生命周期](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
- [Dan 博客](https://overreacted.io/)
- [react codesandbox](https://codesandbox.io/s/new?file=/src/App.js)
- [Vue 转 React不完全指北](https://juejin.cn/post/6953482028188860424)

## vue react 对比

### 参考链接

- [Vue 官方对比 React](https://cn.vuejs.org/v2/guide/comparison.html)
- [lq782655835 Vue和React区别](https://lq782655835.github.io/blogs/vue/diff-vue-vs-react.html)

### 相同处

- 使用 Virtual Dom
- 都使用组件化思想（vue template/react jsx -> render函数 -> 生成VNode -> 当有变化时，新老VNode diff -> diff算法对比，并真正去更新真实DOM）
- 都是响应式，推崇单向数据流
- 都有成熟的社区，都支持服务端渲染

### 不同处

- react 组件的更新粒度比 vue 大，vue 能精确知道需要更新的组件，react 则是会以状态发生变化的组件为根，重新渲染整个组件子树。如要避免不必要的子组件的重渲染，需要在所有可能的地方使用 PureComponent，或是手动实现 shouldComponentUpdate 方法。
- react 中一切都是 javascript，不仅仅是 HTML 可以用 JSX 来表达，现在的潮流也越来越多地将 CSS 也纳入到 JavaScript 中来处理；vue 则更多使用 template。
- CSS 作用域在 react 中是通过 CSS-in-JS 的方案实现的；vue 中可以使用 scope 实现。
- react 社区更繁荣，有更丰富的生态系统。


