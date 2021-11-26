# vue 模板编译原理

[Vue模板编译原理](https://juejin.cn/post/6863241580753616903#heading-0)

vue 分为完整版本(包含模板编译能力)和运行时版本(不包含模板编译能力，需要提前使用 vue-loader 编译)

完整版的编译入口在 `$mount` 函数中，如果没有 `render` 函数又有提供 template 字段，就会在执行真正的 `mount` 函数前调用 `compileToFunctions` 函数编译模板。

`compileToFunctions` 又是通过 `createCompiler` 这个工厂函数返回的。

`createCompiler` 的流程可以分为3步：

- parse：将 template 转化为 AST
- optimize：优化 AST，方便后续虚拟 DOM 更新
- generate：生成代码，将 AST 转化为可执行的代码

## parse

parse 的逻辑是，首先在一个 while 循环中判断是否还有 html 字符串，如果有，判断 `<` 前是否有内容，如果有，则把这部分内容当作文本处理，否则通过正则匹配现在是什么情况，比如注释(`<!— —>`)、开始标签(`<div>`)、结束标签(`</div>`)等。

在解析开始标签的时候，如果该标签不是自闭合标签，会将该标签放入到一个堆栈当中，每次出现结束标签的时候，会从栈顶向下查找同名标签，直到找到同名标签

开始标签会生成一个 AST 节点，处理标签上的属性后加入树形结构中，结束标签同理。

对于文本的处理分为两步，带表达式的文本和纯静态的文本。表达式的文本会提取表达式的内容，然后通过 `_s` 方法包裹。

## optimize

optimize 这一步其实做的就是标记出静态的节点，保证静态的数据可以跳过虚拟 DOM 的更新阶段。

## generate

拼接出 `render` 函数
