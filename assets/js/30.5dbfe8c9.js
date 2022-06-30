(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{388:function(t,e,r){"use strict";r.r(e);var s=r(44),i=Object(s.a)({},(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[r("h1",{attrs:{id:"vite"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#vite"}},[t._v("#")]),t._v(" Vite")]),t._v(" "),r("p",[r("a",{attrs:{href:"https://cn.vitejs.dev/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Vite 官方中文文档"),r("OutboundLink")],1)]),t._v(" "),r("p",[r("a",{attrs:{href:"https://juejin.cn/post/7064853960636989454",target:"_blank",rel:"noopener noreferrer"}},[t._v("深入理解Vite核心原理"),r("OutboundLink")],1)]),t._v(" "),r("p",[t._v("Vite 是一种 Bundleless 构建工具，Bundleless 和传统的构建工具相比，最大的特点就是不用将业务代码打包(第三方库还是得打包）。")]),t._v(" "),r("p",[t._v("Vite 由两部分组成：")]),t._v(" "),r("ul",[r("li",[t._v("一个开发服务器，它基于原生 ES 模块提供了丰富的内建功能，如速度快到惊人的 模块热更新（HMR）。")]),t._v(" "),r("li",[t._v("一套构建指令，它使用 Rollup 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。")])]),t._v(" "),r("p",[t._v("与 Webpack 比较，有两大优势")]),t._v(" "),r("ul",[r("li",[t._v('利用浏览器内置 ES Module 的支持(script 标签加上属性 type="module")，浏览器直接向 dev server 逐个请求各个模块，而不需要提前把所有文件打包')]),t._v(" "),r("li",[t._v("借助 esbuild 超快的编译速度把第三方库进行预构建，一方面将零散的文件打到一起，减少网络请求，另一方面全面转换为 ESM 模块语法，以适配浏览器内置的 ESM 支持。")])]),t._v(" "),r("h2",{attrs:{id:"esbuild"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#esbuild"}},[t._v("#")]),t._v(" Esbuild")]),t._v(" "),r("p",[t._v("Vite 底层使用 Esbuild 实现对 "),r("code",[t._v("ts jsx js")]),t._v(" 代码文件的转化。")]),t._v(" "),r("h2",{attrs:{id:"核心原理"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#核心原理"}},[t._v("#")]),t._v(" 核心原理")]),t._v(" "),r("ul",[r("li",[t._v("当声明一个 script 标签类型为 module 时："),r("code",[t._v('<script type="module" src="/src/main.js"><\/script>')])]),t._v(" "),r("li",[t._v("当浏览器解析资源时，会往当前域名发起一个 GET 请求 main.js 文件")]),t._v(" "),r("li",[t._v("请求到了 main.js 文件，会检测到内部含有 import 引入的包，又会 import 引用发起 HTTP 请求获取模块的内容文件，如App.vue、vue 文件")])]),t._v(" "),r("p",[t._v("Vite 其核心原理是利用浏览器现在已经支持 ES6 的 import，碰见 import 就会发送一个 HTTP 请求去加载文件，Vite 启动一个 "),r("s",[t._v("koa (已变更为 connect)")]),t._v(" 服务器拦截这些请求，并在后端进行相应的处理将项目中使用的文件通过简单的分解与整合，然后再以 ESM 格式返回给浏览器。Vite 整个过程中没有对文件进行打包编译，做到了真正的按需加载，所以其运行速度比原始的 webpack 开发编译速度快出许多。")]),t._v(" "),r("h2",{attrs:{id:"vite-热更新流程"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#vite-热更新流程"}},[t._v("#")]),t._v(" Vite 热更新流程")]),t._v(" "),r("ul",[r("li",[t._v("创建一个 websocket 服务端和 client 文件，启动服务")]),t._v(" "),r("li",[t._v("通过 chokidar 监听文件变更")]),t._v(" "),r("li",[t._v("代码变更后，服务端进行判断并推送到客户端")]),t._v(" "),r("li",[t._v("客户端根据推送的信息执行不同操作的更新")])]),t._v(" "),r("h2",{attrs:{id:"vite-插件"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#vite-插件"}},[t._v("#")]),t._v(" "),r("a",{attrs:{href:"https://juejin.cn/post/7103165205483356168",target:"_blank",rel:"noopener noreferrer"}},[t._v("Vite 插件"),r("OutboundLink")],1)])])}),[],!1,null,null,null);e.default=i.exports}}]);