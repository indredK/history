# Backend Setup Guide

**工期**: 7 天 | **优先级**: 🔴 关键路径

## 快速开始

```bash
# 1. 初始化项目
mkdir backend && cd backend
npm init -y

# 2. 安装依赖
npm install fastify@^4.25 prisma@^5.8 typescript@^5.3 dotenv@^16.3 zod@^3.22
npm install -D tsx @types/node jest @types/jest ts-jest

# 3. 初始化 TypeScript 和 Prisma
npx tsc --init --target ES2020 --module commonjs
npx prisma init

# 4. Docker 启动数据库
cd ..
docker-compose up -d

# 5. 创建数据库表
npx prisma migrate dev --name init

# 6. 导入样例数据
npm run db:seed

# 7. 启动开发服务器
npm run dev
```

## 核心步骤

### Step 1：环境配置

`.env` 文件内容：

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/history_db?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Step 2：数据库初始化

创建 `prisma/schema.prisma`（详见 IMPLEMENTATION_GUIDE.md）

包含 9 张表：
- sources, persons, events, places, admin_units, map_boundary_versions
- event_participants, event_locations, admin_unit_boundaries

### Step 3：API 实现

关键路由：
- `GET/POST /persons` - 人物管理
- `GET/POST /events` - 事件管理
- `GET /events?startYear=600&endYear=800` - 时间范围查询
- `GET /places` - 地点管理
- `GET /timeline` - 时间轴查询

### Step 4：数据导入

```bash
# 执行 seed 脚本加载 data/raw/ 中的 CSV 文件
npm run db:seed
```

### Step 5：测试

```bash
npm run test          # 运行测试
npm run test:watch   # 监听模式
```

### Step 6：部署

```bash
# 构建 Docker 镜像
docker build -t history-api .

# 使用 docker-compose 启动完整环境
docker-compose up
```

## 文件结构

```
backend/
├── src/
│   ├── main.ts
│   ├── server.ts
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
├── prisma/
│   ├── schema.prisma
│   └── seeds.ts
├── tests/
├── .env
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
└── package.json
```

## 验证清单

- [ ] 数据库连接成功
- [ ] 9 张表创建完成
- [ ] 样例数据导入 (65 条)
- [ ] GET /health 返回 200
- [ ] GET /api/v1/persons 返回 20 条
- [ ] GET /api/v1/events 返回 23 条
- [ ] 时间范围查询工作正常
- [ ] 单元测试覆盖率 > 80%

## 详细文档

完整的代码示例、Prisma Schema、API 接口定义详见：
→ [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

## 技术栈

| 组件 | 版本 |
|------|------|
| Node.js | 18 LTS |
| TypeScript | 5.3 |
| Fastify | 4.25 |
| Prisma | 5.8 |
| PostgreSQL | 15 + PostGIS 3.3 |
| Jest | 29.7 |

## 常见问题

**Q: PostGIS 安装失败?**  
A: 使用 `postgis/postgis` Docker 镜像

**Q: Prisma 迁移出错?**  
A: `rm -rf prisma/migrations && npx prisma migrate dev --name init`

**Q: API 返回 "not found"?**  
A: 确保运行过 `npm run db:seed`

---

**下一步**: Task 4 前端原型 (React + MapLibre GL)
