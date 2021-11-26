# npm

## 发布 npm 包步骤

- npm 注册账号：[npmjs](https://www.npmjs.com/signup)
- 创建包文件夹：
- - `md package-name`
- - `cd package-name & npm init`
- npm 包需要的最少内容为：
- - 只需要包含 `name` 和 `version` 的 `package.json` 文件
- 发布包：
- - `npm login` 登录 npm，输入用户名密码，邮箱
- - `npm publish` 发布
- 更新包：
- - 修改 `version`
- - `npm publish` 发布

## 关于 npm 包 name

```js
{
"name": "@[username]/[package-name]"
}
```

在包名前添加 `@[username]` 可以作为一个命名空间，它允许将已经被其他包使用的名称作为包名

这被叫做 `scoped packages`，scoped packages 会被自动发布为私有包，如果需要转成公共包需要用 `npm publish --access=public` 命令发布

## 关于 README

README 中可以使用 [shields.io](https://shields.io/) 添加徽章

[格式事例](https://github.com/Bamblehorse/tiny/blob/master/README.md?plain=1)

## package.json 字段的作用

### files

files 是一个数组，它描述了 npm publish 的时候推送到 npm 服务器的文件列表，支持目录和通配 比如

```json
"files": [
    "LICENSE",
    "History.md",
    "Readme.md",
    "index.js",
    "lib/"
  ],
```

### main

即入口文件

### types

typescript 声明文件入口

### bin

它定义了一系列可执行命令, 在全局安装的命令行包里尤其多见，例如：

```json
"bin": {
  "test": "./bin/test",
},
```

表示安装完以后, 输入 `test` 实际上是运行 `{模块所在目录}/bin/test`

### dependencies devDependencies peerDependencies

分别是

- dependencies：npm 包所依赖的其他 npm 包
- devDependencies：npm 包所依赖的构建和测试相关的 npm 包
- peerDependencies：表示这个包并不依赖模块 A，但是要使用这个包，当前项目必须装了 A

## 配置使用 ts 开发组件包

[从零搭建、开发和发布一个 npm 包（react + webpack + typescript + less）](https://juejin.cn/post/6844904166196772878)
[[译文]一步步构建发布一个 TypeScript NPM 包](https://juejin.cn/post/6844903892119977998)

安装 typescript 依赖，根目录下创建 tsconfig.json 文件

[tsconfig 详细说明](https://www.tslang.cn/docs/handbook/tsconfig-json.html)

```json
// tsconfig.json
{
  "compilerOptions": {
    "outDir": "./dist", // 输出的目录
    "module": "CommonJS", // 指定生成哪个模块系统代码: "None"， "CommonJS"， "AMD"， "System"， "UMD"， "ES6"或 "ES2015" "esnext"
    "target": "ES2015", // 指定 ES 目标版本： "esnext"，默认 ES3
    "jsx": "react", // 在 .tsx 文件里支持 jsx
    "declaration": true, // 生成相应的 .d.ts 文件
    "removeComments": true, // 删除所有注释，除了以 /!* 开头的版权信息。
  },
  "include": [
    "src/**/*", // 需要编译的文件
  ],
  "exclude": [
    "node_modules",
  ],
  "files": []
}
```

使用 include 引入的文件可以使用 exclude 属性过滤。 然而，通过 files 属性明确指定的文件却总是会被包含在内，不管 exclude 如何设置。
