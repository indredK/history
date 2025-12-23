#!/bin/bash

# 数据源切换测试脚本
# 用于验证前后端接口联调和数据源切换功能

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 数据源切换测试脚本${NC}"
echo "=================================="
echo ""

# 检查必要的文件
echo -e "${YELLOW}📋 检查配置文件...${NC}"

if [ ! -f "frontend/src/config/dataSource.ts" ]; then
    echo -e "${RED}❌ 数据源配置文件不存在${NC}"
    exit 1
fi

if [ ! -f "frontend/src/services/dataClient.ts" ]; then
    echo -e "${RED}❌ 数据客户端文件不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 配置文件检查通过${NC}"
echo ""

# 检查当前数据源模式
echo -e "${YELLOW}🔍 检查当前数据源模式...${NC}"
CURRENT_MODE=$(grep "DATA_SOURCE_MODE = " frontend/src/config/dataSource.ts | grep -o '[0-9]')

if [ "$CURRENT_MODE" = "0" ]; then
    echo -e "${GREEN}📊 当前模式: Mock数据 (模拟数据)${NC}"
    echo "   - 数据来源: 本地JSON文件"
    echo "   - 启动要求: 仅需前端"
elif [ "$CURRENT_MODE" = "1" ]; then
    echo -e "${GREEN}📊 当前模式: API数据 (真实接口)${NC}"
    echo "   - 数据来源: 后端数据库"
    echo "   - 启动要求: 前端+后端"
else
    echo -e "${RED}❌ 无法识别数据源模式: $CURRENT_MODE${NC}"
    exit 1
fi
echo ""

# 检查Mock数据文件
echo -e "${YELLOW}📁 检查Mock数据文件...${NC}"
MOCK_FILES=(
    "frontend/public/data/json/dynasties.json"
    "frontend/public/data/json/persons.json"
    "frontend/public/data/json/events.json"
    "frontend/public/data/json/places.json"
)

MOCK_FILES_OK=true
for file in "${MOCK_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (缺失)${NC}"
        MOCK_FILES_OK=false
    fi
done

if [ "$MOCK_FILES_OK" = false ]; then
    echo -e "${YELLOW}⚠️  部分Mock数据文件缺失，Mock模式可能无法正常工作${NC}"
fi
echo ""

# 检查后端配置
echo -e "${YELLOW}🔧 检查后端配置...${NC}"
if [ -f "backend/.env" ]; then
    BACKEND_PORT=$(grep "PORT=" backend/.env | cut -d'=' -f2)
    echo -e "${GREEN}✅ 后端配置文件存在${NC}"
    echo "   - 后端端口: $BACKEND_PORT"
else
    echo -e "${YELLOW}⚠️  后端配置文件不存在，使用默认配置${NC}"
    BACKEND_PORT="3001"
fi
echo ""

# 检查前端配置
echo -e "${YELLOW}🎨 检查前端配置...${NC}"
if [ -f "frontend/.env" ]; then
    FRONTEND_PORT=$(grep "VITE_DEV_PORT=" frontend/.env | cut -d'=' -f2)
    API_BASE_URL=$(grep "VITE_API_BASE_URL=" frontend/.env | cut -d'=' -f2)
    echo -e "${GREEN}✅ 前端配置文件存在${NC}"
    echo "   - 前端端口: $FRONTEND_PORT"
    echo "   - API地址: $API_BASE_URL"
else
    echo -e "${YELLOW}⚠️  前端配置文件不存在，使用默认配置${NC}"
fi
echo ""

# 提供启动建议
echo -e "${BLUE}🚀 启动建议${NC}"
echo "=================================="

if [ "$CURRENT_MODE" = "0" ]; then
    echo -e "${GREEN}当前为Mock模式，建议启动方式:${NC}"
    echo "1. 仅启动前端: bun run dev:frontend"
    echo "2. 完整环境: bun run dev"
    echo ""
    echo -e "${YELLOW}切换到API模式:${NC}"
    echo "修改 frontend/src/config/dataSource.ts 中的 DATA_SOURCE_MODE = 1"
else
    echo -e "${GREEN}当前为API模式，建议启动方式:${NC}"
    echo "1. 完整环境: bun run dev"
    echo "2. 使用脚本: ./scripts/start.sh"
    echo ""
    echo -e "${YELLOW}切换到Mock模式:${NC}"
    echo "修改 frontend/src/config/dataSource.ts 中的 DATA_SOURCE_MODE = 0"
fi

echo ""
echo -e "${BLUE}📚 更多信息请查看: DATA_SOURCE_SWITCH.md${NC}"
echo ""

# 询问是否启动项目
read -p "是否现在启动项目? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🚀 启动项目...${NC}"
    if [ "$CURRENT_MODE" = "0" ]; then
        echo "启动前端开发服务器..."
        bun run dev:frontend
    else
        echo "启动完整开发环境..."
        bun run dev
    fi
else
    echo -e "${YELLOW}👋 测试完成，项目未启动${NC}"
fi