---
sidebar: auto
---

# Git

## 常用 Git 操作

```shell
# 将某个分支上的 commit 摘取出来提交到当前分支, -x -s 可选参数，带上 hash 和签名信息
git cherry-pick [-x] [-s] xxx

# 转移从 A 到 B 的所有提交，包含 A
git cherry-pick A^..B
```

```shell
# 通过再次 commit 相反的内容抵消一次 commit
git revert xxx

# 如果要撤销 merge，可使用 -m 参数， 1 | 2 选取恢复后的代码的基准，1 为当前分支，2 为合并过来的分支
git revert xxx -m 1
```

```shell
# 查看 git 操作记录，然后可以通过 reset —hard HEAD@{n} 来返回到第 n 步时的状态
git reflog

# 撤回 xxx 之后的 commit，将修改放进缓存区
git reset --soft xxx
```

```shell
# 合并多个提交 n 要大于等于要修改的commit 距离 HEAD 的步数
git rebase -i HEAD~n

# 合并 xxx 之后（不包含xxx）到 head 的 commit
git rebase -i xxx

# 强行关闭fast-forward方式
git merge xxx —no-ff

# 合并时忽略空白符，对于格式化文件之后的合并十分有效
git merge xxx -Xignore-all-space
```

```shell
# 没有在 git 版本控制中的文件，是不能被 git stash 存起来的, 需要先 git add . 添加到 git 版本控制中
git stash save ‘save message’

# 清空你所有的 stash 内容
git stash clear

# 这是删除第一个队列
git stash drop stash@{0}

# 弹出栈顶的修改
git stash pop
```

## commit type

`feat:`: 类型为 `feat` 的提交表示在代码库中新增了一个功能。

`fix:`：类型为 `fix` 的 提交表示在代码库中修复了一个 bug。

`docs:`: 只是更改文档。

`style:`: 不影响代码含义的变化（空白、格式化、缺少分号等）。

`refactor:`: 代码重构，既不修复错误也不添加功能。

`perf:`: 改进性能的代码更改。

`test:`: 添加确实测试或更正现有的测试。

`build:`: 影响构建系统或外部依赖关系的更改（示例范围：gulp、broccoli、NPM）。

`ci:`: 更改持续集成文件和脚本（示例范围：Travis、Circle、BrowserStack、SauceLabs）。

`chore:`: 其他，不修改`src`或`test`文件。

`revert:`: commit 回退。

## GitHub Actions

[GitHub Actions 入门教程](http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)

### 生成密钥

[创建个人访问令牌](https://docs.github.com/cn/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)

将这个密钥储存到当前仓库的 `Settings/Secrets` 里面，配置 `ACCESS_TOKEN` 变量。

### 生成 workflow 文件

在这个仓库的.github/workflows目录，生成一个 workflow 文件，名字可以随便取，这个示例是ci.yml

```yml
name: GitHub Actions Build and Deploy

# 触发条件: push 到 master 分支后
on:
  push:
    branches:
      - master

# 设置上海时区
env:
  TZ: Asia/Shanghai

# 任务
jobs:
  build-and-deploy:
    # 服务器环境：最新版 ubuntu
    runs-on: ubuntu-latest
    steps:
      # 拉取代码
      - name: Checkout
        uses: actions/checkout@v2
        with:
          persist-credentials: false

      # 打包静态文件
      - name: Build
        run: npm install && npm run build

      # 部署
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@releases/v3
        with:
          # GitHub 密钥
          ACCESS_TOKEN: ${{ secrets.ACCESS_TOKEN }}
          # GitHub Pages 读取的分支
          BRANCH: gh-pages
          # 静态文件所在目录
          FOLDER: dist
```

```yml
name: Generate Readme

on:
  issues:
    types: [opened]

jobs:
  bot:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          persist-credentials: false
      # 执行自己的脚本文件
      - name: Run Script
        run: npm install && npm run build
      - name: Push
        uses: github-actions-x/commit@v2.7
        with:
          github-token: ${{ secrets.ACCESS_TOKEN }}
          push-branch: master
          commit-message: 'Update README.md by Github Actions'
          name: xx
          email: xx
```

## 利用 git hooks 不同项目配置不同 git 账号

[git hooks](https://juejin.cn/post/6844903849275162631#heading-3)

`git hooks` 的配置就 `.git/hooks` 目录下，以无后缀的脚本文件的形式存在，文件名称即是钩子名称，文件内容是 `shell` 脚本

### pre-commit

需要赋予 git hook 钩子权限 `chmod 700 .git/hooks/pre-commit`

```shell
#!/bin/sh
target_name="theydy"
target_email="ydythebs@qq.com"

current_name=$(git config user.name)
current_email=$(git config user.email)

if [ $target_name == $current_name ] && [ $target_email == $current_email ]
then
  exit 0
else
  git config user.name $target_name
  git config user.email $target_email
  echo "项目 git 账号切换成功，请再次提交"
  exit 1
fi
```
