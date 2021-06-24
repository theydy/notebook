# webpack

## webpack 执行流程

webpack 的构建流程。

首先解析 config 和 shell 中的配置项，合并生成 options

然后调用 webpack 函数，返回 compiler 对象，实例化 compiler 对象后会初始化 webpack 内置的插件和 options 配置，并将它们挂载在 compiler 对象上，compiler 相当于一个全局的执行上下文，上面记录了完整的 webpack 环境信息，一个 webpack 进程中，只会生成一次 compiler

**执行 compiler 的 run 方法开始编译**，首先构建 compilation 对象，这个对象负责组织整个编译过程，对象上包含每个构建环节对应的方法，还保存着 modules，chunks，生成的 assets 以及最后生成 js 的 template，每次编译都会生成一个新的 compilation

**在 make 钩子中执行 compilation 的 addEntry 方法**，addEntry 中又调用 _addModuleChain 开始构建模块

构建模块首先执行相应的 loader 对读取的源文件进行处理，然后转成 ast，遍历 ast 找到所有的依赖模块，接着递归构建所有的依赖模块。

**执行 compilation 的 seal 方法**，这个方法主要调用各插件对构建后的结果进行封装和修改。

最后调用 **compiler.emitAssets** 按照 output 中的配置输出文件。

## 常用的钩子

**compiler：**

- run
- compile
- make
- emit
- done

**compilation：**

- buildModule
- seal
- optimize

## loader

就是一个函数，接受「源文件文件内容」做为参数

## plugin

一个类，需要实现 apply 方法，apply 方法接受「compiler」做为参数

## 优化手段

### module 优化配置

- noParse：去除不需要 webpack 处理的文件
- rules：test、include、exclude 配置范围内需要处理的文件

### resolve 优化配置

- alias：路径别名
- extensions：导入文件后缀优先级

### 相关优化 loader plugin

- ThreadLoader：多进程处理 loader
- MiniCssExtractPlugin：提取 css
- OptimizeCssAssetsWebpackPlugin：压缩 css，optimization.minimizer
- TerserWebpackPlugin：多进程压缩 js，optimization.minimizer

### splitChunks 代码分割

主要是 optimization.splitChunks.cacheGroups 配置

## HMR 热更新原理

服务端和客户端会建立 websocket 连接，当 webpack 监听到文件被修改，触发了重新编译，编译完成后在 done 钩子中通过 websocket 向客户端推动当前编译的 hash，如果客户端比较 hash 不一致，就会通过 ajax 和 jsonp 向服务端获取最新的资源完成替换。

所以一般来说 webpack-dev-server 和 HMR 要配对使用，否则会无效，如果使用了 webpack-dev-middleware 而没有使用 webpack-dev-server，请使用 webpack-hot-middleware 依赖包开启 HMR。
