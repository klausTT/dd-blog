#!/usr/bin/env sh

# 忽略错误
set -e

# 构建
yarn docs:build

# 进入待发布的目录
cd docs/.vuepress/dist 

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
git push -f git@github.com:klausTT/dd-page.git master


cd -