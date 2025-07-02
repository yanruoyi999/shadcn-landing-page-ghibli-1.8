#!/bin/bash

echo "🎉 准备推送 Ghibli AI Generator v1.8 到 GitHub"
echo "📍 仓库地址: https://github.com/yanruoyi999/shadcn-landing-page-ghibli-1.8"
echo ""

cd "/Users/yanruoyi/Desktop/cursor/shadcn-landing-page-ghibli-1.8"

echo "📊 当前状态检查:"
echo "✅ Git仓库: $(git rev-parse --show-toplevel)"
echo "✅ 当前分支: $(git branch --show-current)"
echo "✅ 提交数量: $(git rev-list --count HEAD)"
echo "✅ 远程仓库: $(git remote get-url origin 2>/dev/null || echo '未配置')"
echo ""

echo "🚀 执行推送命令:"
echo "git push -u origin main"
echo ""

# 执行推送
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 成功上传到GitHub!"
    echo "📱 访问你的仓库: https://github.com/yanruoyi999/shadcn-landing-page-ghibli-1.8"
    echo ""
    echo "🌟 v1.8特性预览:"
    echo "  🎨 AI宫崎骏风格图像生成"
    echo "  🔒 增强安全性和速率限制"  
    echo "  ⚡ 性能优化和错误处理"
    echo "  🌍 中英文国际化支持"
    echo "  📱 完全响应式设计"
else
    echo ""
    echo "❌ 推送失败，请检查:"
    echo "1. GitHub仓库是否已创建"
    echo "2. 网络连接是否正常"
    echo "3. GitHub认证是否有效"
fi