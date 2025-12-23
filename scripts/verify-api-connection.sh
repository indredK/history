#!/bin/bash

# API连接验证脚本
# 验证前后端是否正常连通

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔗 前后端API连接验证${NC}"
echo "=================================="
echo ""

# 检查后端是否运行
echo -e "${YELLOW}📦 检查后端服务...${NC}"
if curl -s http://localhost:3001/api/v1/health > /dev/null; then
    echo -e "${GREEN}✅ 后端服务正常运行 (端口3001)${NC}"
    BACKEND_OK=true
else
    echo -e "${RED}❌ 后端服务未运行或无法访问${NC}"
    BACKEND_OK=false
fi

# 检查前端是否运行
echo -e "${YELLOW}🎨 检查前端服务...${NC}"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ 前端服务正常运行 (端口5173)${NC}"
    FRONTEND_OK=true
else
    echo -e "${RED}❌ 前端服务未运行或无法访问${NC}"
    FRONTEND_OK=false
fi

# 检查前端代理
echo -e "${YELLOW}🔄 检查前端代理...${NC}"
if curl -s http://localhost:5173/api/v1/health > /dev/null; then
    echo -e "${GREEN}✅ 前端代理工作正常${NC}"
    PROXY_OK=true
else
    echo -e "${RED}❌ 前端代理无法访问后端API${NC}"
    PROXY_OK=false
fi

echo ""
echo -e "${BLUE}🧪 API端点测试${NC}"
echo "=================================="

# 测试主要API端点
ENDPOINTS=("health" "dynasties" "persons" "events")
ALL_ENDPOINTS_OK=true

for endpoint in "${ENDPOINTS[@]}"; do
    echo -n "测试 /$endpoint ... "
    if curl -s "http://localhost:5173/api/v1/$endpoint" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ 正常${NC}"
    else
        echo -e "${RED}❌ 失败${NC}"
        ALL_ENDPOINTS_OK=false
    fi
done

echo ""
echo -e "${BLUE}📊 测试结果总结${NC}"
echo "=================================="

if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ] && [ "$PROXY_OK" = true ] && [ "$ALL_ENDPOINTS_OK" = true ]; then
    echo -e "${GREEN}🎉 所有测试通过！前后端API连接正常${NC}"
    echo ""
    echo -e "${GREEN}✅ 后端服务: http://localhost:3001${NC}"
    echo -e "${GREEN}✅ 前端服务: http://localhost:5173${NC}"
    echo -e "${GREEN}✅ API文档: http://localhost:3001/api/docs${NC}"
    echo -e "${GREEN}✅ 前端代理: 正常工作${NC}"
    echo ""
    echo -e "${BLUE}🎯 数据源切换测试:${NC}"
    echo "1. 访问 http://localhost:5173"
    echo "2. 查看右上角数据源指示器"
    echo "3. 点击信息图标查看详细状态"
    echo "4. 修改 frontend/src/config/dataSource.ts 中的 DATA_SOURCE_MODE 来切换数据源"
    
    exit 0
else
    echo -e "${RED}❌ 部分测试失败${NC}"
    echo ""
    
    if [ "$BACKEND_OK" = false ]; then
        echo -e "${YELLOW}💡 启动后端: bun run dev:backend${NC}"
    fi
    
    if [ "$FRONTEND_OK" = false ]; then
        echo -e "${YELLOW}💡 启动前端: bun run dev:frontend${NC}"
    fi
    
    if [ "$PROXY_OK" = false ]; then
        echo -e "${YELLOW}💡 检查Vite代理配置: frontend/vite.config.ts${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}💡 启动完整环境: bun run dev${NC}"
    
    exit 1
fi