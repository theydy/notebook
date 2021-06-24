#!/usr/bin/env sh
set -e

npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:theydy/notebook.git master:gh-pages

cd -