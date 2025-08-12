#!/bin/bash

# 子平命理系统前端部署脚本
# 部署到 https://www.zipingdestiny.cloud/

echo "🚀 开始部署子平命理系统前端..."

# 创建构建目录
mkdir -p dist

# 复制所有前端文件到构建目录
echo "📁 复制文件到构建目录..."
cp index.html dist/
cp script.js dist/
cp style.css dist/
cp config.js dist/
cp api-services.js dist/
cp report.html dist/
cp report.js dist/
cp report.css dist/
cp test-flow.html dist/
cp test.html dist/

# 如果有其他资源文件，也可以复制
if [ -d "assets" ]; then
    cp -r assets dist/
fi

if [ -d "images" ]; then
    cp -r images dist/
fi

echo "✅ 文件复制完成！"
echo "📦 构建目录: ./dist"
echo ""
echo "🌐 部署选项："
echo "1. 使用 Vercel: vercel --prod"
echo "2. 使用 Netlify: netlify deploy --prod --dir=dist"
echo "3. 使用 GitHub Pages: 推送到 gh-pages 分支"
echo "4. 使用传统服务器: 上传 dist 目录内容到服务器"
echo ""
echo "🔗 部署完成后访问: https://www.zipingdestiny.cloud/"
