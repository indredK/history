#!/bin/bash

echo "🔍 诊断后端启动问题..."
echo ""

# 检查Node.js版本
echo "📋 检查Node.js版本:"
node --version
echo ""

# 检查后端目录
echo "📁 检查后端目录:"
if [ -d "backend" ]; then
    echo "✅ backend目录存在"
else
    echo "❌ backend目录不存在"
    exit 1
fi
echo ""

# 检查后端依赖
echo "📦 检查后端依赖:"
if [ -d "backend/node_modules" ]; then
    echo "✅ node_modules存在"
else
    echo "❌ node_modules不存在，需要安装依赖"
    echo "运行: cd backend && bun install"
    exit 1
fi
echo ""

# 检查NestJS CLI
echo "🔧 检查NestJS CLI:"
if [ -f "backend/node_modules/.bin/nest" ]; then
    echo "✅ NestJS CLI存在"
else
    echo "❌ NestJS CLI不存在"
    exit 1
fi
echo ""

# 检查数据库文件
echo "🗄️ 检查数据库:"
if [ -f "backend/dev.db" ]; then
    echo "✅ 数据库文件存在"
else
    echo "⚠️ 数据库文件不存在，可能需要运行迁移"
    echo "运行: cd backend && npx prisma migrate dev"
fi
echo ""

# 检查环境文件
echo "⚙️ 检查环境配置:"
if [ -f "backend/.env" ]; then
    echo "✅ .env文件存在"
    echo "内容:"
    cat backend/.env
else
    echo "❌ .env文件不存在"
fi
echo ""

# 尝试启动后端（测试模式）
echo "🚀 尝试启动后端（测试模式）:"
echo "运行: cd backend && timeout 10s ./node_modules/.bin/nest start"
cd backend
timeout 10s ./node_modules/.bin/nest start 2>&1 | head -20
echo ""

echo "🏁 诊断完成！"