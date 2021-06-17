#!/usr/bin/env sh
set -e

npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f https://github.com/theydy/notebook.git master:gh-pages

cd -