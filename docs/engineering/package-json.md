# npm 包

## package.json 字段记录

[npm package.json 文档](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)

| 字段 | 用途 |
| :-- | :-- |
| name | 项目名 |
| version | 项目版本 |
| description | 项目描述 |
| keywords | 项目关键字 |
| homepage | 略 |
| bugs | 略 |
| license | 使用协议 |
| files | 发布项目时导出的文件列表，使用 glob 语法，`package.json`、`README`、`LICENSE / LICENCE`、`main 字段指向的文件` 这些文件优先级是高于 files 字段的。 |
| main | 默认入口文件 |
| module | 做为一个 ES Module 模块被加载时的入口文件，如果没有会降级使用 main |
| browser | 指明浏览器环境下的入口文件，此时 browser 优先级高于 main |
| bin | 项目提供终端中可使用的命令和对应的执行文件 |
| type | 项目内使用哪种模块规范 |
| directories | 略 |
| repository | 略 |
| scripts | 执行 npm 脚本的命令简写 |
| dependencies | 生产环境下，项目运行所需依赖 |
| devDependencies | 开发环境下，项目运行所需依赖 |
| peerDependencies | 使用项目需要预先安装的依赖 |

## 包管理工具

- npm
- yarn
- pnpm

### pnpm

pnpm 的优点：

- 包安装速度极快
- 磁盘空间利用非常高效：使用硬链接和软链接来避免复制所有本地缓存源文件，不会重复安装同一个包
- 支持 monorepo：npm 或 yarn 需要配合 learn 等三方库才支持 monorepo
- node_module 不是扁平结构：避免了幽灵依赖（即：未在 dependencies 里声明依赖，但代码里使用了这个包）

npm yarn 之所以会有依赖提升，即使用扁平结构，是为了减少 node_modules 的层级嵌套过深。
