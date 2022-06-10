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

### npm 和 yarn 的区别

- yarn 下载速度比 npm 快：yarn 有并行安装和离线模式（下载过的包从缓存拿）
- yarn 安装版本统一：yarn 有 lock 文件，但是新版 npm 也有了
- yarn 的语义化更好

### pnpm

[pnpm 文档](https://pnpm.io/zh/)

pnpm 的核心是将所有的包都存放在一个资源仓库中，而每个项目的 node_modules 通过软链接的形式将包链接到资源仓库中，这样不仅节省了空间，同时也加快了安装速度

pnpm 的优点：

- 包安装速度极快
- 磁盘空间利用非常高效：使用硬链接和软链接来避免复制所有本地缓存源文件，不会重复安装同一个包
- 支持 monorepo：npm 或 yarn 需要配合 learn 等三方库才支持 monorepo
- node_module 不是扁平结构：避免了幽灵依赖（即：未在 dependencies 里声明依赖，但代码里使用了这个包）

npm yarn 之所以会有依赖提升，即使用扁平结构，是为了减少 node_modules 的层级嵌套过深。

- 软链接：存储另一个硬链接的地址的链接
- 硬链接：指向对应文件的 inode（index node） 的链接

**使用**

```sh
# 安装
npm install -g pnpm

# 升级 pnpm
pnpm add -g pnpm

# 动态包执行，等同与 npx
pnpm dlx xxx

# 等同与 npm install
pnpm install

# 等同与 npm i xxx
pnpm add xxx

# 等同与 npm run <cmd>
pnpm <cmd>
```

[**pnpn 使用 workspace**](https://pnpm.io/zh/workspaces)

- 根目录下创建 `pnpm-workspace.yaml`

```code
packages:
  # all packages in subdirs of packages/ and components/
  - 'packages/**'
  - 'components/**'
  # exclude packages that are inside test directories
  - '!**/test/**'
```

- 在 workspace 根目录使用 pnpm install 命令时，会自动将 workspace 中的所有项目执行 pnpm install
- pnpm 支持协议 workspace:，当使用这个协议时，pnpm 只会解析本地 workspace 中的包

```code
"foo": "workspace:*"
"foo": "workspace:../foo"
"foo": "workspace:~",
"foo": "workspace:^",
"zoo": "workspace:^1.5.0"
```

- 当需要发布包时，使用 pnpm pack 或者 pnpm publish 命令时，将动态的把 workspace: 协议替换为真正的版本号