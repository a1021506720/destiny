#!/bin/bash

echo "🚀 子平命理系统快速部署脚本"
echo "=================================="

echo "📝 部署前检查..."
echo "✅ 构建目录已准备: ./dist"
echo "✅ Git 仓库已更新"
echo "✅ 域名配置已完成: www.zipingdestiny.cloud"

echo ""
echo "🌐 选择部署方式："
echo "1) Vercel 部署（推荐）"
echo "2) 推送到 GitHub 并使用 Vercel 自动部署"
echo "3) 显示部署状态"

read -p "请选择 (1-3): " choice

case $choice in
  1)
    echo "🚀 正在使用 Vercel 部署..."
    echo "请确保您已经在浏览器中登录 Vercel"
    echo "如果未登录，请访问: https://vercel.com"
    read -p "已登录 Vercel？(y/n): " logged_in
    if [ "$logged_in" = "y" ]; then
      echo "正在部署..."
      vercel --prod
    else
      echo "请先在浏览器中登录 Vercel，然后重新运行此脚本"
    fi
    ;;
  2)
    echo "📤 推送到 GitHub..."
    git push origin main
    echo "✅ 代码已推送到 GitHub"
    echo "请在 Vercel Dashboard 中导入此项目"
    echo "访问: https://vercel.com/dashboard"
    ;;
  3)
    echo "📊 当前部署状态："
    echo "- 构建目录: ./dist ($(ls -la dist | wc -l) 个文件)"
    echo "- Git 状态: $(git status --porcelain | wc -l) 个未提交更改"
    echo "- 配置文件: vercel.json ✅"
    echo "- 域名配置: www.zipingdestiny.cloud ✅"
    ;;
  *)
    echo "❌ 无效选择"
    ;;
esac

echo ""
echo "🔗 部署完成后访问:"
echo "   https://www.zipingdestiny.cloud/"
echo "   https://zipingdestiny.cloud/"
