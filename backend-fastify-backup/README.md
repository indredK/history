# History API Backend

中国历史全景 API 服务

## 快速开始

### 前置条件

- Node.js 18+
- Docker 和 Docker Compose
- npm 或 yarn

### 设置步骤

1. **复制环境文件**:
```bash
cp .env.example .env
```

2. **启动数据库**:
```bash
cd ..
docker-compose up -d
cd backend
```

3. **安装依赖**:
```bash
npm install
```

4. **初始化数据库**:
```bash
npx prisma migrate dev --name init
```

5. **导入样例数据**:
```bash
npm run db:seed
```

6. **启动开发服务器**:
```bash
npm run dev
```

API 将运行在 `http://localhost:3001`

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (热重载) |
| `npm run build` | 编译 TypeScript |
| `npm run start` | 启动生产服务器 |
| `npm run db:migrate` | 运行 Prisma 迁移 |
| `npm run db:seed` | 导入样例数据 |
| `npm run db:studio` | 打开 Prisma Studio (GUI) |
| `npm run test` | 运行测试 |
| `npm run lint` | 类型检查 |

## API 端点

### 人物 (Persons)
- `GET /api/v1/persons` - 获取所有人物
- `GET /api/v1/persons/:id` - 获取单个人物

### 事件 (Events)  
- `GET /api/v1/events` - 获取所有事件
- `GET /api/v1/events?startYear=600&endYear=800` - 时间范围查询

### 地点 (Places)
- `GET /api/v1/places` - 获取所有地点

### 时间轴 (Timeline)
- `GET /api/v1/timeline?startYear=600&endYear=800` - 时间范围的事件

## 技术栈

- **Fastify** - 高性能 HTTP 框架
- **Prisma** - 类型安全的 ORM
- **PostgreSQL** - 关系型数据库
- **PostGIS** - 地理信息扩展
- **TypeScript** - 类型安全的 JavaScript
- **Jest** - 测试框架

## 项目结构

```
src/
  main.ts           # 应用入口
  
prisma/
  schema.prisma     # 数据模型定义
  seeds.ts          # 数据导入脚本
  
tests/
  api.test.ts       # 测试文件
  
.env.example        # 环境变量示例
```

## 数据库架构

9 个核心表：
- `sources` - 数据来源
- `persons` - 历史人物
- `events` - 历史事件
- `places` - 地点
- `admin_units` - 行政单元
- `map_boundary_versions` - 地图边界
- `event_participants` - 事件-人物关联
- `event_locations` - 事件-地点关联
- `admin_unit_boundaries` - 行政单元-边界关联

详见 [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)

## 故障排排查

**数据库连接失败**:
```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs postgres
```

**Prisma 迁移错误**:
```bash
# 删除现有迁移
rm -rf prisma/migrations

# 重新创建
npx prisma migrate dev --name init
```

**端口被占用**:
```bash
# 修改 .env 中的 PORT，或关闭占用的进程
lsof -i :3001
```

## 许可证

MIT
