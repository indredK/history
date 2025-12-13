# Phase 1 - Task 3：后端服务与 PostGIS 数据库 (Backend API & Database Setup)

**预计工期**: 1-2 周（1 人，全职）  
**开始日期**: 2025-12-13（周一）  
**目标完成**: 2025-12-20（MVP 阶段末）  
**优先级**: 🔴 关键路径 (Critical Path)

---

## 任务目标

建立生产级的后端 API 服务和地理信息数据库，为前端提供数据接口和时间/地理查询能力。

**关键里程碑**:

1. **Week 1-3 (D1-D7)**
   - 初始化 Node.js + TypeScript 项目
   - 部署 PostgreSQL + PostGIS
   - 实现 9 个数据表的 DDL
   - 编写基础 CRUD API (6 个路由)
   - 集成样例数据导入

2. **Week 2-4 (D8-D14)**
   - 实现高级查询 (时间范围、地理范围、全文搜索)
   - 添加数据验证与约束
   - 编写单元测试 (>80% 覆盖)
   - 容器化与本地部署验证

---

## 资源清单

### 依赖

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "dependencies": {
    "fastify": "^4.25",
    "prisma": "^5.8",
    "typescript": "^5.3",
    "dotenv": "^16.3",
    "zod": "^3.22"
  },
  "devDependencies": {
    "tsx": "^4.7",
    "jest": "^29.7",
    "@types/node": "^20.10"
  }
}
```

### 技术栈确认

| 组件 | 选择 | 版本 | 用途 |
|------|------|------|------|
| Runtime | Node.js | 18 LTS | JavaScript 执行环境 |
| Language | TypeScript | 5.3 | 类型安全 |
| Framework | Fastify | 4.25 | 高性能 HTTP 框架 |
| ORM | Prisma | 5.8 | 数据库访问 |
| Database | PostgreSQL | 15+ | 关系型数据库 |
| GIS Extension | PostGIS | 3.3+ | 地理信息处理 |
| Validation | Zod | 3.22 | 运行时数据验证 |
| Testing | Jest | 29.7 | 单元测试框架 |

---

## 实施步骤

### Phase 1.1：项目初始化 (D1-D2)

#### Step 1.1.1：创建项目结构

```bash
# 初始化 Node.js 项目
mkdir backend
cd backend
npm init -y

# 安装核心依赖
npm install fastify@^4.25 prisma@^5.8 typescript@^5.3 dotenv@^16.3 zod@^3.22
npm install -D tsx @types/node jest @types/jest ts-jest

# 初始化 TypeScript
npx tsc --init --target ES2020 --module commonjs

# 初始化 Prisma
npx prisma init
```

#### Step 1.1.2：项目目录结构

```
backend/
├── src/
│   ├── main.ts                 # 应用入口
│   ├── server.ts               # Fastify 配置
│   ├── routes/
│   │   ├── persons.routes.ts   # 人物相关路由
│   │   ├── events.routes.ts    # 事件相关路由
│   │   ├── places.routes.ts    # 地点相关路由
│   │   └── admin-units.routes.ts
│   ├── controllers/
│   │   ├── persons.controller.ts
│   │   ├── events.controller.ts
│   │   └── places.controller.ts
│   ├── services/
│   │   ├── persons.service.ts
│   │   ├── events.service.ts
│   │   └── data-loader.service.ts
│   ├── types/
│   │   ├── index.ts            # 共享类型定义
│   │   └── prisma-extensions.ts
│   ├── utils/
│   │   ├── logger.ts           # 日志工具
│   │   ├── validators.ts       # 验证规则
│   │   └── errors.ts           # 错误处理
│   └── config/
│       └── database.ts         # 数据库配置
├── prisma/
│   ├── schema.prisma           # 数据模型定义
│   └── seeds.ts                # 数据种子
├── tests/
│   ├── persons.test.ts
│   ├── events.test.ts
│   └── setup.ts                # Jest 配置
├── .env.example                # 环境变量示例
├── tsconfig.json               # TypeScript 配置
├── jest.config.js              # Jest 配置
└── package.json                # NPM 配置
```

#### Step 1.1.3：环境配置

创建 `.env` 文件：

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/history_db?schema=public"
DATABASE_POOL_SIZE=20

# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# API
API_VERSION=v1
API_PREFIX=/api/v1

# CORS
CORS_ORIGIN=http://localhost:5173

# PostGIS
POSTGIS_ENABLED=true
```

### Phase 1.2：数据库设计与初始化 (D3-D4)

#### Step 1.2.1：PostgreSQL + PostGIS 部署

**本地开发（Docker Compose）**:

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    container_name: history-db
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: history_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

启动命令：

```bash
docker-compose up -d
docker-compose logs -f postgres
```

#### Step 1.2.2：Prisma Schema 定义

创建 `prisma/schema.prisma`：

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 来源表：追踪所有数据的原始来源
model Source {
  id          String    @id @default(uuid())
  title       String    @db.VarChar(255)
  author      String?   @db.VarChar(255)
  url         String?
  accessedAt  DateTime?
  license     String?   @db.VarChar(50)   // "CC-BY-4.0", "CC0", "PD"
  confidence  Float     @default(0.8)      // 0.0-1.0
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // 关联
  persons     Person[]
  events      Event[]
  places      Place[]
  adminUnits  AdminUnit[]
  boundaries  MapBoundaryVersion[]

  @@index([title])
  @@map("sources")
}

// 人物表：历史人物与人文信息
model Person {
  id           String    @id @default(uuid())
  name         String    @db.VarChar(100)
  nameEn       String?   @db.VarChar(200)
  birthYear    Int?      // BC 用负数
  birthMonth   Int?      // 1-12
  deathYear    Int?
  deathMonth   Int?      // 1-12
  biography    String?   @db.Text
  roles        String[]  @default([])    // ["emperor", "general", "scholar"]
  confidence   Float     @default(0.8)
  contributors String[]  @default([])
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // 关联
  sourceIds    String[]
  sources      Source[]   @relation(fields: [sourceIds], references: [id])
  events       EventParticipant[]

  @@index([name])
  @@index([birthYear])
  @@index([deathYear])
  @@map("persons")
}

// 事件表：历史事件与重要变革
model Event {
  id           String    @id @default(uuid())
  title        String    @db.VarChar(200)
  titleEn      String?   @db.VarChar(300)
  startYear    Int
  startMonth   Int?      // 1-12
  endYear      Int
  endMonth     Int?
  description  String?   @db.Text
  eventType    String    @db.VarChar(50)  // "war", "diplomacy", "reform" 等
  confidence   Float     @default(0.8)
  contributors String[]  @default([])
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // 关联
  sourceIds    String[]
  sources      Source[]   @relation(fields: [sourceIds], references: [id])
  participants EventParticipant[]
  locations    EventLocation[]

  @@index([startYear])
  @@index([endYear])
  @@index([eventType])
  @@map("events")
}

// 事件-人物关联：表示人物在事件中的角色
model EventParticipant {
  id        String   @id @default(uuid())
  eventId   String
  personId  String
  role      String?  @db.VarChar(100)

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  person    Person   @relation(fields: [personId], references: [id], onDelete: Cascade)

  @@unique([eventId, personId])
  @@map("event_participants")
}

// 地点表：历史地点与地名
model Place {
  id              String     @id @default(uuid())
  canonicalName   String     @db.VarChar(100)
  altNames        String[]   @default([])
  description     String?    @db.Text
  latitude        Float?
  longitude       Float?
  confidence      Float      @default(0.8)
  contributors    String[]   @default([])
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  // 关联
  sourceIds       String[]
  sources         Source[]   @relation(fields: [sourceIds], references: [id])
  events          EventLocation[]

  @@index([canonicalName])
  @@map("places")
}

// 事件-地点关联：表示事件的发生地点
model EventLocation {
  id        String   @id @default(uuid())
  eventId   String
  placeId   String
  role      String?  @db.VarChar(100)

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  place     Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)

  @@unique([eventId, placeId])
  @@map("event_locations")
}

// 行政单元：朝代、省份、郡县等行政区划
model AdminUnit {
  id        String    @id @default(uuid())
  name      String    @db.VarChar(100)
  nameEn    String?   @db.VarChar(200)
  type      String    @db.VarChar(50)    // "empire", "province", "prefecture"
  parentId  String?
  validFrom Int
  validTo   Int?
  confidence Float    @default(0.8)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // 关联
  sourceIds String[]
  sources   Source[]  @relation(fields: [sourceIds], references: [id])
  boundaries AdminUnitBoundary[]

  parent    AdminUnit? @relation("AdminUnitHierarchy", fields: [parentId], references: [id])
  children  AdminUnit[] @relation("AdminUnitHierarchy")

  @@index([validFrom])
  @@index([validTo])
  @@map("admin_units")
}

// 地图边界版本：不同时期的地理边界（GeoJSON）
model MapBoundaryVersion {
  id           String    @id @default(uuid())
  name         String?   @db.VarChar(200)
  validFrom    Int
  validTo      Int?
  geometryType String?   @db.VarChar(50)  // "GeoJSON", "TopoJSON"
  geometryUrl  String?                      // S3/CDN 路径
  geometryHash String?   @db.VarChar(64)
  confidence   Float     @default(0.8)
  contributors String[]  @default([])
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // 关联
  sourceIds   String[]
  sources     Source[]  @relation(fields: [sourceIds], references: [id])
  adminUnits  AdminUnitBoundary[]

  @@index([validFrom])
  @@index([validTo])
  @@map("map_boundary_versions")
}

// 行政单元-边界关联：将行政单元与具体的地理边界关联
model AdminUnitBoundary {
  id                  String   @id @default(uuid())
  adminUnitId         String
  boundaryVersionId   String

  adminUnit           AdminUnit @relation(fields: [adminUnitId], references: [id], onDelete: Cascade)
  boundaryVersion     MapBoundaryVersion @relation(fields: [boundaryVersionId], references: [id], onDelete: Cascade)

  @@unique([adminUnitId, boundaryVersionId])
  @@map("admin_unit_boundaries")
}
```

#### Step 1.2.3：Prisma 迁移与初始化

```bash
# 生成迁移文件
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate

# 验证数据库连接
npx prisma db push

# 打开 Prisma Studio 查看数据
npx prisma studio
```

### Phase 1.3：API 路由实现 (D5-D7)

#### Step 1.3.1：Fastify 服务器初始化

创建 `src/server.ts`：

```typescript
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        }
      }
    }
  });

  // 注册 CORS
  await fastify.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  });

  // 健康检查
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() };
  });

  // API 路由前缀
  const apiPrefix = process.env.API_PREFIX || '/api/v1';

  // 注册路由
  fastify.register(async (fastify) => {
    // 人物路由
    fastify.get('/persons', async (request, reply) => {
      const persons = await prisma.person.findMany({
        include: { sources: true, events: true }
      });
      return persons;
    });

    fastify.get('/persons/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      const person = await prisma.person.findUnique({
        where: { id },
        include: { sources: true, events: true }
      });
      if (!person) {
        return reply.code(404).send({ error: 'Person not found' });
      }
      return person;
    });

    // 事件路由
    fastify.get('/events', async (request, reply) => {
      const events = await prisma.event.findMany({
        include: { sources: true, participants: true, locations: true }
      });
      return events;
    });

    // 地点路由
    fastify.get('/places', async (request, reply) => {
      const places = await prisma.place.findMany({
        include: { sources: true }
      });
      return places;
    });

    // 时间范围查询
    fastify.get('/timeline', async (request, reply) => {
      const { startYear, endYear } = request.query as {
        startYear?: string;
        endYear?: string;
      };

      const events = await prisma.event.findMany({
        where: {
          AND: [
            { startYear: { lte: parseInt(endYear || '2025') } },
            { endYear: { gte: parseInt(startYear || '-3000') } }
          ]
        },
        orderBy: { startYear: 'asc' },
        include: { participants: true, locations: true }
      });

      return events;
    });

  }, { prefix: apiPrefix });

  return fastify;
}
```

#### Step 1.3.2：主应用入口

创建 `src/main.ts`：

```typescript
import { buildServer } from './server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const fastify = await buildServer();
  
  const port = parseInt(process.env.PORT || '3001');
  const host = '0.0.0.0';

  try {
    // 验证数据库连接
    await prisma.$connect();
    console.log('✅ Database connected');

    await fastify.listen({ port, host });
    console.log(`🚀 Server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

#### Step 1.3.3：数据导入脚本

创建 `prisma/seeds.ts`：

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. 导入 Sources
  const sources = [
    { title: '史记', author: '司马迁', license: 'CC0', confidence: 0.95 },
    { title: '《资治通鉴》', author: '司马光', license: 'CC0', confidence: 0.90 },
    { title: 'CHGIS v6.0', license: 'CC-BY-4.0', confidence: 0.95 }
  ];

  for (const source of sources) {
    await prisma.source.upsert({
      where: { title: source.title },
      update: {},
      create: source
    });
  }
  console.log('✅ Sources seeded');

  // 2. 导入 Persons (从 CSV)
  const personsPath = path.join(__dirname, '../data/raw/persons.csv');
  const personsData = fs.readFileSync(personsPath, 'utf-8');
  const persons = parse(personsData, { columns: true });

  for (const row of persons) {
    await prisma.person.create({
      data: {
        name: row.name,
        nameEn: row.name_en,
        birthYear: row.birth_year ? parseInt(row.birth_year) : null,
        deathYear: row.death_year ? parseInt(row.death_year) : null,
        biography: row.biography,
        roles: row.roles ? row.roles.split(',') : []
      }
    });
  }
  console.log('✅ Persons seeded');

  // 3. 导入 Events (从 CSV)
  const eventsPath = path.join(__dirname, '../data/raw/events.csv');
  const eventsData = fs.readFileSync(eventsPath, 'utf-8');
  const events = parse(eventsData, { columns: true });

  for (const row of events) {
    await prisma.event.create({
      data: {
        title: row.title,
        startYear: parseInt(row.start_year),
        endYear: parseInt(row.end_year),
        description: row.description,
        eventType: row.event_type || 'other'
      }
    });
  }
  console.log('✅ Events seeded');

  // 4. 导入 Places (从 CSV)
  const placesPath = path.join(__dirname, '../data/raw/places.csv');
  const placesData = fs.readFileSync(placesPath, 'utf-8');
  const places = parse(placesData, { columns: true });

  for (const row of places) {
    await prisma.place.create({
      data: {
        canonicalName: row.canonical_name,
        altNames: row.alt_names ? row.alt_names.split(',') : [],
        description: row.description,
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null
      }
    });
  }
  console.log('✅ Places seeded');

  console.log('✨ Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js",
    "db:seed": "tsx prisma/seeds.ts",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Phase 1.4：测试与验证 (D8-D14)

#### Step 1.4.1：单元测试

创建 `tests/persons.test.ts`：

```typescript
import { buildServer } from '../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Persons API', () => {
  let fastify;

  beforeAll(async () => {
    fastify = await buildServer();
  });

  afterAll(async () => {
    await fastify.close();
    await prisma.$disconnect();
  });

  it('GET /api/v1/persons should return array of persons', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/persons'
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /api/v1/persons/:id should return a person', async () => {
    // 先创建一个人物
    const person = await prisma.person.create({
      data: {
        name: 'Test Person',
        birthYear: -259,
        deathYear: -210
      }
    });

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/persons/${person.id}`
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.name).toBe('Test Person');
  });
});
```

#### Step 1.4.2：集成测试

```bash
# 运行所有测试
npm run test

# 生成覆盖率报告
npm run test -- --coverage
```

### Phase 1.5：容器化与部署 (D14+)

#### Step 1.5.1：Dockerfile

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm install
RUN npm run build
RUN npx prisma generate

# 复制应用代码
COPY src ./src

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "start"]
```

#### Step 1.5.2：Docker Compose 完整配置

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: history_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/history_db?schema=public
      NODE_ENV: development
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run dev

volumes:
  postgres_data:
```

启动命令：

```bash
docker-compose up -d
docker-compose logs -f api
```

---

## 关键 API 端点参考

### 人物 (Persons)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/v1/persons` | 获取所有人物 |
| GET | `/api/v1/persons/:id` | 获取单个人物 |
| POST | `/api/v1/persons` | 创建人物 |
| PATCH | `/api/v1/persons/:id` | 更新人物 |
| DELETE | `/api/v1/persons/:id` | 删除人物 |

### 事件 (Events)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/v1/events` | 获取所有事件 |
| GET | `/api/v1/events?startYear=600&endYear=800` | 时间范围查询 |
| POST | `/api/v1/events` | 创建事件 |

### 地点 (Places)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/v1/places` | 获取所有地点 |
| GET | `/api/v1/places?lat=34.34&lon=108.95&radius=100` | 地理范围查询 |

### 时间轴 (Timeline)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/v1/timeline?startYear=600&endYear=800` | 时间范围的所有事件 |

---

## 成功标准

### 功能验证

- [ ] ✅ 数据库连接正常 (`npx prisma studio` 可访问)
- [ ] ✅ 9 张表成功创建
- [ ] ✅ 样例数据导入完成 (65 条记录)
- [ ] ✅ GET /health 返回 200
- [ ] ✅ GET /api/v1/persons 返回 20 条记录
- [ ] ✅ GET /api/v1/events 返回 23 条记录
- [ ] ✅ GET /api/v1/places 返回 20 条记录
- [ ] ✅ 时间范围查询能正确过滤事件

### 代码质量

- [ ] ✅ TypeScript 编译无错误
- [ ] ✅ 单元测试覆盖率 > 80%
- [ ] ✅ 所有路由都有错误处理
- [ ] ✅ Prisma 类型检查通过

### 文档与交付物

- [ ] ✅ API 文档完整 (Postman Collection)
- [ ] ✅ 数据库 Schema 文档
- [ ] ✅ 部署指南 (Docker 配置)
- [ ] ✅ 环境变量说明

---

## 常见问题与排障

### Q: PostGIS 安装失败
A: 使用 `postgis/postgis` Docker 镜像，自动包含 PostGIS

### Q: Prisma 迁移出错
A: 删除旧迁移文件：`rm -rf prisma/migrations/` 后重新生成

### Q: API 返回 "Person not found"
A: 确认数据库已执行 `npm run db:seed`

### Q: CORS 错误
A: 检查 `.env` 的 `CORS_ORIGIN` 配置，默认 `http://localhost:5173`

---

## 下一步 (Next Steps)

- Task 3 完成后，立即开始 Task 4（前端原型）
- Task 4 需要 API endpoints，使用此处定义的路由
- Task 5 并行执行 GIS 数据处理

---

## 参考资源

- [Fastify 文档](https://www.fastify.io)
- [Prisma 文档](https://www.prisma.io/docs)
- [PostgreSQL PostGIS](https://postgis.net)
- [Task 2 完成报告](./TASK_2_REPORT.md) - 样例数据说明
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - 详细代码示例

---

**准备开始**: 
确保已完成 Task 2，然后执行 Step 1.1.1 初始化项目。

**预计完成**: 2025-12-20（7 天后，MVP 就绪）
