#!/bin/bash

echo "🔍 验证部署配置..."

# 检查必要文件
echo "📁 检查必要文件..."
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo "❌ GitHub Actions 工作流文件不存在"
    exit 1
fi

if [ ! -f "frontend/package.json" ]; then
    echo "❌ 前端 package.json 不存在"
    exit 1
fi

if [ ! -f "frontend/vite.config.ts" ]; then
    echo "❌ Vite 配置文件不存在"
    exit 1
fi

echo "✅ 所有必要文件都存在"

# 检查构建
echo "🔨 测试构建..."
cd frontend
if npm run build; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

# 检查构建输出
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ 构建输出正常"
else
    echo "❌ 构建输出异常"
    exit 1
fi

echo "🎉 部署配置验证完成！"
echo "📝 下一步："
echo "1. git add ."
echo "2. git commit -m '修复 GitHub Actions 版本'"
echo "3. git push origin main"
echo "4. 在 GitHub 仓库设置中启用 Pages"