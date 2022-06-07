# webpack 原理

## webpack 构建流程

- entry-option：初始化 option
- run：开始编译
- make：从 entry 开始递归分析依赖，对每个依赖模块进行 build
- before-resolve：对模块位置进行解析
- build-module：开始构建某个模块
- normal-module-loader：将 loader 加载完成的 module 进行编译，生成 ast 树
- program：遍历 ast，当遇到 require 等调用表达式时，收集依赖
- seal：所有依赖 build 完成，开始优化
- emit：输出到 dist 目录

webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：

- 首先会从配置文件和 Shell 语句中读取与合并参数，并初始化需要使用的插件和配置插件等执行环境所需要的参数；
- 初始化完成后会调用 Compiler 的 run 来真正启动 webpack 编译构建过程，webpack 的构建流程包括 compile、make、build、seal、emit 阶段，执行完这些阶段就完成了构建过程。

## 初始化

从配置文件和 Shell 语句中读取与合并参数

用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译

## 编译构建

根据配置中的 entry 找出所有的入口文件

从入口文件出发，调用所有配置的 Loader 对模块进行处理，再找出该模块依赖的模块，递归本步骤直到所有入口依赖的文件都经过了本步骤的处理

经过上面一步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系

根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会

在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

## 总结流程

从配置文件和 Shell 语句中读取、合并参数

然后调用 webpack 函数，生成 compiler 对象，实例化 compiler 对象后会初始化 webpack 内置的插件和 options 配置，并将它们挂载在 compiler 对象上，compiler 相当于一个全局的执行上下文，上面记录了完整的 webpack 环境信息，一个 webpack 进程中，只会生成一次 compiler

**执行 compiler 的 run 方法开始编译**，首先构建 compilation 对象，这个对象负责组织整个编译过程，对象上包含每个构建环节对应的方法，还保存着 modules，chunks，生成的 assets 以及最后生成 js 的 template，每次编译都会生成一个新的 compilation

**执行 compilation 的 addEntry 方法** 开始构建模块

构建模块首先从入口文件出发，执行相应的 loader 对读取的模块进行处理，然后转成 ast，遍历 ast 找到所有的依赖模块，接着递归构建所有的依赖模块。

根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表

最后调用 **compiler.emitAssets** 按照 output 中的配置输出文件。

## 实现一个简易的 webpack

```js
// compile.js
const { getAST, getDependencies, transform } = require("./parser");
const path = require("path");
const fs = require("fs");

module.exports = class Compiler {
  constructor(options) {
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;
    this.modules = [];
  }
  // 开启编译
  run() {
    const entryModule = this.buildModule(this.entry, true);
    this.modules.push(entryModule);
    this.modules.map((_module) => {
      _module.dependencies.map((dependency) => {
        this.modules.push(this.buildModule(dependency));
      });
    });
    this.emitFiles();
  }
  // 构建模块相关
  buildModule(filename, isEntry) {
    let ast;
    if (isEntry) {
      ast = getAST(filename);
    } else {
      const absolutePath = path.join(process.cwd(), "./src", filename);
      ast = getAST(absolutePath);
    }

    return {
      filename, // 文件名称
      dependencies: getDependencies(ast), // 依赖列表
      transformCode: transform(ast), // 转化后的代码
    };
  }
  // 输出文件
  emitFiles() {
    const outputPath = path.join(this.output.path, this.output.filename);
    let modules = "";
    this.modules.map((_module) => {
      modules += `'${_module.filename}' : function(require, module, exports) {${_module.transformCode}},`;
    });

    const bundle = `
        (function(modules) {
          function require(fileName) {
            const fn = modules[fileName];
            const module = { exports:{}};
            fn(require, module, module.exports)
            return module.exports
          }
          require('${this.entry}')
        })({${modules}})
    `;

    fs.writeFileSync(outputPath, bundle, "utf-8");
  }
};

```

```js
// parser.js
const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("babel-core");
module.exports = {
  // 解析我们的代码生成AST抽象语法树
  getAST: (path) => {
    const source = fs.readFileSync(path, "utf-8");

    return parser.parse(source, {
      sourceType: "module", //表示我们要解析的是ES模块
    });
  },
  // 对AST节点进行递归遍历
  getDependencies: (ast) => {
    const dependencies = [];
    traverse(ast, {
      ImportDeclaration: ({ node }) => {
        dependencies.push(node.source.value);
      },
    });
    return dependencies;
  },
  // 将获得的ES6的AST转化成ES5
  transform: (ast) => {
    const { code } = transformFromAst(ast, null, {
      presets: ["env"],
    });
    return code;
  },
};

```