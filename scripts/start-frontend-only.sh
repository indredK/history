#!/bin/bash

echo "🎭 启动前端（Mock数据模式）..."
echo ""

# 检查数据源配置
echo "📊 检查数据源配置..."
if grep -q "DATA_SOURCE_MODE: 0 | 1 = 0" frontend/src/config/dataSource.ts; then
    echo "✅ 数据源已设置为Mock模式"
else
    echo "⚠️ 数据源未设置为Mock模式，正在修改..."
    sed -i.bak 's/DATA_SOURCE_MODE: 0 | 1 = 1/DATA_SOURCE_MODE: 0 | 1 = 0/' frontend/src/config/dataSource.ts
    echo "✅ 数据源已切换到Mock模式"
fi
echo ""

# 启动前端
echo "🚀 启动前端服务器..."
echo "🔗 前端地址: http://localhost:5173"
echo "🎭 数据模式: Mock数据（无需后端）"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

cd frontend && bun run dev