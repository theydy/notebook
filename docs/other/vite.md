# Vite

[Vite 官方中文文档](https://cn.vitejs.dev/)

[深入理解Vite核心原理](https://juejin.cn/post/7064853960636989454)

Vite 是一种 Bundleless 构建工具，Bundleless 和传统的构建工具相比，最大的特点就是不用将业务代码打包(第三方库还是得打包）。

Vite 由两部分组成：

- 一个开发服务器，它基于原生 ES 模块提供了丰富的内建功能，如速度快到惊人的 模块热更新（HMR）。
- 一套构建指令，它使用 Rollup 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。

与 Webpack 比较，有两大优势

- 利用浏览器内置 ES Module 的支持(script 标签加上属性 type="module")，浏览器直接向 dev server 逐个请求各个模块，而不需要提前把所有文件打包
- 借助 esbuild 超快的编译速度把第三方库进行预构建，一方面将零散的文件打到一起，减少网络请求，另一方面全面转换为 ESM 模块语法，以适配浏览器内置的 ESM 支持。

## Esbuild

Vite 底层使用 Esbuild 实现对 `ts jsx js` 代码文件的转化。

## 核心原理

- 当声明一个 script 标签类型为 module 时：`<script type="module" src="/src/main.js"></script>`
- 当浏览器解析资源时，会往当前域名发起一个 GET 请求 main.js 文件
- 请求到了 main.js 文件，会检测到内部含有 import 引入的包，又会 import 引用发起 HTTP 请求获取模块的内容文件，如App.vue、vue 文件

Vite 其核心原理是利用浏览器现在已经支持 ES6 的 import，碰见 import 就会发送一个 HTTP 请求去加载文件，Vite 启动一个 ~~koa (已变更为 connect)~~ 服务器拦截这些请求，并在后端进行相应的处理将项目中使用的文件通过简单的分解与整合，然后再以 ESM 格式返回给浏览器。Vite 整个过程中没有对文件进行打包编译，做到了真正的按需加载，所以其运行速度比原始的 webpack 开发编译速度快出许多。

## Vite 热更新流程

- 创建一个 websocket 服务端和 client 文件，启动服务
- 通过 chokidar 监听文件变更
- 代码变更后，服务端进行判断并推送到客户端
- 客户端根据推送的信息执行不同操作的更新

## [Vite 插件](https://juejin.cn/post/7103165205483356168)

