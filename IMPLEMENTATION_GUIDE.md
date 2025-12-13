# 实施细节指南 (Implementation Guide)

> 从文档到代码：逐步推进"中国历史全视界"开发

本文档是对 [ROADMAP.md](./ROADMAP.md) 的深化，提供**具体的代码示例、工具命令、文件结构**与**逐周的执行计划**。

---

## 目录

1. [阶段 1：数据模型与后端（第 2-3 周）](#阶段-1数据模型与后端第-2-3-周)
2. [阶段 2：前端原型与交互（第 4-5 周）](#阶段-2前端原型与交互第-4-5-周)
3. [阶段 3：GIS 数据管线与瓦片（第 6-7 周）](#阶段-3gis-数据管线与瓦片第-6-7-周)
4. [阶段 4：CI/CD 与部署（第 8 周）](#阶段-4cicd-与部署第-8-周)
5. [开发者工具链与检查清单](#开发者工具链与检查清单)

---

## 阶段 1：数据模型与后端（第 2-3 周）

### 周期目标
- ✅ 完成 PostgreSQL + PostGIS 数据库设计与初始化
- ✅ 实现基础 CRUD API（Person, Event, Place）
- ✅ 编写数据导入脚本与样例数据
- ✅ 配置 Docker 开发环境

### 1.1 数据库设计与表结构

#### 步骤 1：创建数据库文件结构

```bash
# 在项目根目录创建数据库相关目录
mkdir -p backend/database/migrations backend/database/seeds backend/database/schemas

# 创建初始化脚本
touch backend/database/init.sql
touch backend/database/seeds/seed.sql
touch backend/database/schemas/schema.sql
```

#### 步骤 2：编写核心表结构（`backend/database/schemas/schema.sql`）

```sql
-- 启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. 来源与引用
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  url TEXT,
  accessed_date DATE,
  license VARCHAR(100),  -- CC-BY-4.0, CC0, PD 等
  confidence DECIMAL(3, 2) DEFAULT 0.8,  -- 0-1 可信度
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 历史人物表
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  birth_year SMALLINT,
  birth_month SMALLINT,
  death_year SMALLINT,
  death_month SMALLINT,
  biography TEXT,
  roles TEXT[],  -- 数组：emperor, general, scholar 等
  source_ids UUID[],  -- 参考来源
  confidence DECIMAL(3, 2) DEFAULT 0.8,
  contributors TEXT[],  -- GitHub 用户名
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_years CHECK (birth_year <= death_year OR death_year IS NULL)
);

-- 3. 地点/地名表
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name VARCHAR(100) NOT NULL,
  alt_names TEXT[],  -- 历史别名：中山郡, 恒州 等
  description TEXT,
  location GEOMETRY(POINT, 4326),  -- WGS84 坐标
  source_ids UUID[],
  confidence DECIMAL(3, 2) DEFAULT 0.8,
  contributors TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 历史事件表
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  start_year SMALLINT NOT NULL,
  start_month SMALLINT,
  end_year SMALLINT,
  end_month SMALLINT,
  description TEXT,
  event_type VARCHAR(50),  -- war, diplomacy, culture, disaster, reform
  source_ids UUID[],
  confidence DECIMAL(3, 2) DEFAULT 0.8,
  contributors TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_dates CHECK (start_year <= end_year OR end_year IS NULL)
);

-- 5. 事件-人物关联表
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  role VARCHAR(100),  -- 主角, 参与者, 反对者 等
  CONSTRAINT unique_participant UNIQUE (event_id, person_id)
);

-- 6. 事件-地点关联表
CREATE TABLE event_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  role VARCHAR(100),  -- 发生地, 影响地, 途经地 等
  CONSTRAINT unique_location UNIQUE (event_id, place_id)
);

-- 7. 行政单元表（朝代、省份、郡县等）
CREATE TABLE admin_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  type VARCHAR(50) NOT NULL,  -- empire, province, prefecture, county
  parent_id UUID REFERENCES admin_units(id),
  valid_from SMALLINT NOT NULL,
  valid_to SMALLINT,
  source_ids UUID[],
  confidence DECIMAL(3, 2) DEFAULT 0.8,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 地图边界版本表（用于时间序列的地理数据）
CREATE TABLE map_boundary_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200),  -- 唐代行政区划, 元代疆域 等
  valid_from SMALLINT NOT NULL,
  valid_to SMALLINT,
  geometry_type VARCHAR(50),  -- GeoJSON, TopoJSON, MVT
  geometry_url TEXT,  -- S3/CDN 路径或本地路径
  geometry_hash VARCHAR(64),  -- SHA256 用于版本控制
  source_ids UUID[],
  confidence DECIMAL(3, 2) DEFAULT 0.8,
  contributors TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 关联：行政单元与地图边界版本
CREATE TABLE admin_unit_boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_unit_id UUID NOT NULL REFERENCES admin_units(id),
  boundary_version_id UUID NOT NULL REFERENCES map_boundary_versions(id),
  CONSTRAINT unique_ab UNIQUE (admin_unit_id, boundary_version_id)
);

-- 9. 索引（性能优化）
CREATE INDEX idx_persons_birth_year ON persons(birth_year);
CREATE INDEX idx_persons_death_year ON persons(death_year);
CREATE INDEX idx_events_start_year ON events(start_year);
CREATE INDEX idx_events_end_year ON events(end_year);
CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_admin_units_type ON admin_units(type);
CREATE INDEX idx_map_boundary_years ON map_boundary_versions(valid_from, valid_to);
```

#### 步骤 3：初始化数据库

```bash
# 创建开发数据库
createdb history_dev

# 执行初始化脚本
psql history_dev < backend/database/schemas/schema.sql

# 验证表结构
psql history_dev -c "\dt"
```

### 1.2 后端框架搭建

#### 步骤 1：选择与初始化（推荐 Node.js + Fastify）

```bash
# 创建后端目录
mkdir -p backend && cd backend

# 初始化 Node.js 项目
npm init -y

# 安装核心依赖
npm install fastify fastify-cors fastify-helmet \
            @prisma/client prisma dotenv cors \
            typescript @types/node ts-node \
            pg postgis-core

# 安装开发依赖
npm install -D @types/express jest ts-jest \
              nodemon @typescript-eslint/eslint-plugin

# 初始化 TypeScript
npx tsc --init
```

#### 步骤 2：创建 Prisma 数据模型（`backend/prisma/schema.prisma`）

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Source {
  id            String   @id @default(uuid())
  title         String
  author        String?
  url           String?
  accessedDate  DateTime?
  license       String?
  confidence    Float    @default(0.8)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("sources")
}

model Person {
  id              String   @id @default(uuid())
  name            String
  nameEn          String?
  birthYear       Int?
  birthMonth      Int?
  deathYear       Int?
  deathMonth      Int?
  biography       String?
  roles           String[]
  sourceIds       String[]
  confidence      Float    @default(0.8)
  contributors    String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  events          EventParticipant[]

  @@map("persons")
}

model Place {
  id              String   @id @default(uuid())
  canonicalName   String
  altNames        String[]
  description     String?
  sourceIds       String[]
  confidence      Float    @default(0.8)
  contributors    String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  events          EventLocation[]

  @@map("places")
}

model Event {
  id              String   @id @default(uuid())
  title           String
  titleEn         String?
  startYear       Int
  startMonth      Int?
  endYear         Int?
  endMonth        Int?
  description     String?
  eventType       String?
  sourceIds       String[]
  confidence      Float    @default(0.8)
  contributors    String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  participants    EventParticipant[]
  locations       EventLocation[]

  @@map("events")
  @@index([startYear])
  @@index([endYear])
}

model EventParticipant {
  id        String   @id @default(uuid())
  eventId   String
  personId  String
  role      String?

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  person    Person   @relation(fields: [personId], references: [id], onDelete: Cascade)

  @@unique([eventId, personId])
  @@map("event_participants")
}

model EventLocation {
  id        String   @id @default(uuid())
  eventId   String
  placeId   String
  role      String?

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  place     Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)

  @@unique([eventId, placeId])
  @@map("event_locations")
}

model AdminUnit {
  id          String   @id @default(uuid())
  name        String
  nameEn      String?
  type        String
  parentId    String?
  validFrom   Int
  validTo     Int?
  sourceIds   String[]
  confidence  Float    @default(0.8)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  parent      AdminUnit?         @relation("AdminUnitHierarchy", fields: [parentId], references: [id])
  children    AdminUnit[]         @relation("AdminUnitHierarchy")
  boundaries  AdminUnitBoundary[]

  @@map("admin_units")
}

model MapBoundaryVersion {
  id              String   @id @default(uuid())
  name            String?
  validFrom       Int
  validTo         Int?
  geometryType    String?
  geometryUrl     String?
  geometryHash    String?
  sourceIds       String[]
  confidence      Float    @default(0.8)
  contributors    String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  adminUnits      AdminUnitBoundary[]

  @@map("map_boundary_versions")
  @@index([validFrom, validTo])
}

model AdminUnitBoundary {
  id                  String   @id @default(uuid())
  adminUnitId         String
  boundaryVersionId   String

  adminUnit           AdminUnit           @relation(fields: [adminUnitId], references: [id])
  boundaryVersion     MapBoundaryVersion  @relation(fields: [boundaryVersionId], references: [id])

  @@unique([adminUnitId, boundaryVersionId])
  @@map("admin_unit_boundaries")
}
```

#### 步骤 3：生成 Prisma 客户端并迁移

```bash
# 初始化 Prisma
npx prisma init

# 更新 .env 文件
# DATABASE_URL="postgresql://user:password@localhost:5432/history_dev"

# 生成迁移
npx prisma migrate dev --name init

# 生成 Prisma 客户端
npx prisma generate
```

### 1.3 基础 API 实现（`backend/src/routes/`）

创建三个核心路由文件：

**`backend/src/routes/persons.ts`**
```typescript
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function personRoutes(fastify: FastifyInstance) {
  // GET 所有人物（带分页与过滤）
  fastify.get('/persons', async (request, reply) => {
    const { skip = 0, take = 10, name, birthYear } = request.query as any;
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (birthYear) where.birthYear = { gte: birthYear - 5, lte: birthYear + 5 };

    const [data, total] = await Promise.all([
      prisma.person.findMany({ where, skip: parseInt(skip), take: parseInt(take) }),
      prisma.person.count({ where }),
    ]);

    return { data, total, page: skip / take + 1, pageSize: take };
  });

  // GET 单个人物详情（含关联事件）
  fastify.get('/persons/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        events: { include: { event: true } },
      },
    });
    if (!person) return reply.code(404).send({ error: 'Person not found' });
    return person;
  });

  // POST 新增人物
  fastify.post('/persons', async (request, reply) => {
    const { name, nameEn, birthYear, deathYear, biography } = request.body as any;
    const person = await prisma.person.create({
      data: { name, nameEn, birthYear, deathYear, biography },
    });
    return reply.code(201).send(person);
  });

  // PATCH 更新人物
  fastify.patch('/persons/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const updated = await prisma.person.update({
      where: { id },
      data: request.body as any,
    });
    return updated;
  });

  // DELETE 删除人物
  fastify.delete('/persons/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.person.delete({ where: { id } });
    return reply.code(204).send();
  });
}
```

**类似地创建** `events.ts` 和 `places.ts` 路由（结构相同）

### 1.4 样例数据导入

**`backend/database/seeds/seed.sql`**（或 Node.js 脚本）

```sql
-- 插入样例来源
INSERT INTO sources (id, title, author, url, license, confidence) VALUES
  ('src_001', '资治通鉴', '司马光', 'https://zh.wikisource.org/wiki/%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%91', 'PD', 0.95),
  ('src_002', 'CHGIS v6.0', 'Harvard University', 'http://www.fas.harvard.edu/~chgis/', 'CC-BY-SA-3.0', 0.95);

-- 插入样例人物
INSERT INTO persons (id, name, name_en, birth_year, death_year, biography, roles, source_ids, contributors) VALUES
  ('per_001', '李世民', 'Li Shimin', 598, 649, '唐太宗，中国历史上杰出的皇帝...', '{"emperor","military_leader"}', '{"src_001"}', '{"user1"}'),
  ('per_002', '武则天', 'Wu Zetian', 624, 705, '中国历史上唯一的女皇帝...', '{"emperor","reformer"}', '{"src_001"}', '{"user1"}');

-- 插入样例事件
INSERT INTO events (id, title, title_en, start_year, end_year, description, event_type, source_ids, contributors) VALUES
  ('evt_001', '玄武门之变', 'Xuanwu Gate Incident', 626, 626, '李世民发动政变，夺取皇位...', 'war', '{"src_001"}', '{"user1"}'),
  ('evt_002', '安史之乱', 'An Lushan Rebellion', 755, 763, '唐代最大的内乱，安禄山与史思明发动叛乱...', 'war', '{"src_001"}', '{"user1"}');

-- 关联人物与事件
INSERT INTO event_participants (event_id, person_id, role) VALUES
  ('evt_001', 'per_001', '主角'),
  ('evt_002', 'per_001', '应对者');
```

运行：
```bash
psql history_dev < backend/database/seeds/seed.sql
```

### 1.5 Docker 配置（`backend/docker-compose.yml`）

```yaml
version: '3.9'

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_USER: historydev
      POSTGRES_PASSWORD: secretpass123
      POSTGRES_DB: history_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U historydev']
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://historydev:secretpass123@postgres:5432/history_dev
      NODE_ENV: development
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

启动：
```bash
docker-compose up -d
```

### 1.6 检查清单

- [ ] PostgreSQL + PostGIS 已安装并初始化
- [ ] 所有表结构已创建
- [ ] Prisma schema 已定义
- [ ] 基础 CRUD API 已实现
- [ ] 样例数据已导入
- [ ] 所有 API 端点已测试（`curl` 或 Postman）
- [ ] 代码已提交到 `feat/backend-core` 分支

---

## 阶段 2：前端原型与交互（第 4-5 周）

### 周期目标
- ✅ 创建 React + TypeScript 项目
- ✅ 集成 MapLibre GL 地图库
- ✅ 实现时间轴组件
- ✅ 实现事件/人物列表与详情页
- ✅ 三向联动（时间轴 ↔ 地图 ↔ 列表）

### 2.1 项目初始化

```bash
# 使用 Vite 创建 React 项目
npm create vite@latest frontend -- --template react-ts
cd frontend

# 安装核心依赖
npm install \
  maplibre-gl @maplibre/maplibre-gl-draw \
  deck.gl @deck.gl/react \
  zustand react-hook-form \
  tailwindcss postcss autoprefixer \
  axios date-fns

# 初始化 Tailwind
npx tailwindcss init -p

# 安装开发依赖
npm install -D @types/maplibre-gl @types/deck.gl
```

### 2.2 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapView.tsx       # 主地图组件
│   │   │   ├── LayerControl.tsx  # 图层控制
│   │   │   └── MapLegend.tsx     # 图例
│   │   ├── Timeline/
│   │   │   ├── TimelineControl.tsx # 时间轴主组件
│   │   │   ├── YearSlider.tsx     # 年份滑块
│   │   │   └── DynastyJumper.tsx   # 朝代快速跳转
│   │   ├── EventList/
│   │   │   ├── EventCard.tsx      # 事件卡片
│   │   │   └── EventListView.tsx  # 列表容器
│   │   ├── PersonList/
│   │   │   ├── PersonCard.tsx
│   │   │   └── PersonListView.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── hooks/
│   │   ├── useTimeline.ts        # 时间轴状态 hook
│   │   ├── useMap.ts             # 地图交互 hook
│   │   └── useApi.ts             # API 调用 hook
│   ├── stores/
│   │   └── appStore.ts           # Zustand 全局状态
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义
│   ├── api/
│   │   └── client.ts             # API 客户端
│   ├── utils/
│   │   ├── mapUtils.ts
│   │   └── dateUtils.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── EventDetail.tsx
│   │   └── PersonDetail.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/
└── vite.config.ts
```

### 2.3 核心组件实现

**`src/components/Map/MapView.tsx`**
```typescript
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapViewProps {
  year?: number;
}

export const MapView: React.FC<MapViewProps> = ({ year = 2000 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [105, 35], // 中国中心
      zoom: 4,
    });

    // 加载 GeoJSON 边界
    map.current.on('load', () => {
      map.current?.addSource('boundaries', {
        type: 'geojson',
        data: `/data/boundaries_${year}.geojson`,
      });

      map.current?.addLayer({
        id: 'boundaries-fill',
        type: 'fill',
        source: 'boundaries',
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.4,
        },
      });

      map.current?.addLayer({
        id: 'boundaries-line',
        type: 'line',
        source: 'boundaries',
        paint: {
          'line-color': '#088',
          'line-width': 2,
        },
      });
    });

    return () => map.current?.remove();
  }, []);

  // 更新边界数据（当年份变化）
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;
    const source = map.current?.getSource('boundaries') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(`/data/boundaries_${year}.geojson`);
    }
  }, [year]);

  return <div ref={mapContainer} className='w-full h-[600px]' />;
};
```

**`src/components/Timeline/TimelineControl.tsx`**
```typescript
import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';

const DYNASTIES = [
  { name: '秦汉', years: [221, 220] },
  { name: '唐', years: [618, 907] },
  { name: '宋', years: [960, 1279] },
  { name: '元', years: [1271, 1368] },
  { name: '明', years: [1368, 1644] },
  { name: '清', years: [1644, 1912] },
];

export const TimelineControl: React.FC = () => {
  const { year, setYear } = useAppStore();
  const [rangeStart, setRangeStart] = useState(1000);
  const [rangeEnd, setRangeEnd] = useState(2000);

  return (
    <div className='p-4 bg-white shadow rounded'>
      <h3 className='text-lg font-bold mb-4'>时间轴</h3>

      {/* 年份滑块 */}
      <div className='mb-4'>
        <input
          type='range'
          min='221'
          max='2025'
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className='w-full'
        />
        <p className='text-center text-sm mt-2'>{year} 年</p>
      </div>

      {/* 朝代快速跳转 */}
      <div className='mb-4'>
        <p className='text-sm font-semibold mb-2'>快速跳转朝代：</p>
        <div className='flex flex-wrap gap-2'>
          {DYNASTIES.map((dynasty) => (
            <button
              key={dynasty.name}
              onClick={() => setYear(dynasty.years[0])}
              className='px-3 py-1 text-sm border rounded hover:bg-gray-100'
            >
              {dynasty.name}
            </button>
          ))}
        </div>
      </div>

      {/* 范围选择 */}
      <div className='text-sm'>
        <label>范围: </label>
        <input
          type='number'
          value={rangeStart}
          onChange={(e) => setRangeStart(parseInt(e.target.value))}
          className='border px-2 py-1 mr-2 w-20'
        />
        -
        <input
          type='number'
          value={rangeEnd}
          onChange={(e) => setRangeEnd(parseInt(e.target.value))}
          className='border px-2 py-1 ml-2 w-20'
        />
      </div>
    </div>
  );
};
```

**`src/stores/appStore.ts`**
```typescript
import { create } from 'zustand';

interface AppState {
  year: number;
  setYear: (year: number) => void;
  selectedEvent: string | null;
  setSelectedEvent: (id: string | null) => void;
  selectedPerson: string | null;
  setSelectedPerson: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  year: 2000,
  setYear: (year) => set({ year }),
  selectedEvent: null,
  setSelectedEvent: (id) => set({ selectedEvent: id }),
  selectedPerson: null,
  setSelectedPerson: (id) => set({ selectedPerson: id }),
}));
```

### 2.4 样例数据（GeoJSON）

**`public/data/boundaries_2000.geojson`**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "中华人民共和国",
        "year": 2000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[...中国边界坐标...]]]
      }
    }
  ]
}
```

### 2.5 API 集成

**`src/api/client.ts`**
```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const eventsApi = {
  getAll: (year?: number) => 
    apiClient.get('/events', { params: { startYear: year } }),
  getById: (id: string) => 
    apiClient.get(`/events/${id}`),
};

export const personsApi = {
  getAll: () => apiClient.get('/persons'),
  getById: (id: string) => apiClient.get(`/persons/${id}`),
};

export const placesApi = {
  getAll: () => apiClient.get('/places'),
  getById: (id: string) => apiClient.get(`/places/${id}`),
};
```

### 2.6 检查清单

- [ ] React 项目已创建
- [ ] 地图库（MapLibre GL）已集成并可显示
- [ ] 时间轴组件已实现
- [ ] 事件/人物列表已实现
- [ ] 三向联动已测试
- [ ] API 集成已完成
- [ ] 所有组件已用 TypeScript 类型化
- [ ] 代码已提交到 `feat/frontend-proto` 分支

---

## 阶段 3：GIS 数据管线与瓦片（第 6-7 周）

### 周期目标
- ✅ 采集与整合 CHGIS、OpenHistoricalMap 数据
- ✅ QGIS 中进行地理配准与矢量化
- ✅ GeoJSON 数据清洗与验证
- ✅ 使用 Tippecanoe 生成矢量瓦片
- ✅ CDN 与对象存储配置

### 3.1 数据采集脚本

**`data/scripts/download_chgis.sh`**
```bash
#!/bin/bash
# 从 CHGIS 官网下载数据

mkdir -p data/raw/chgis

# 下载各时期边界数据
for year in 220 618 907 960 1368 1644 1912 1949 2000; do
  echo "Downloading CHGIS data for year $year..."
  # 实际下载命令（根据 CHGIS 提供的 API）
  # wget "http://www.fas.harvard.edu/~chgis/..." -O "data/raw/chgis/${year}.zip"
done
```

### 3.2 数据处理管线（GDAL/OGR）

**`data/scripts/process_boundaries.sh`**
```bash
#!/bin/bash
# 将 Shapefile 转换为 GeoJSON，添加时间属性

for shp_file in data/raw/chgis/*.shp; do
  year=$(basename "$shp_file" .shp)
  output="data/processed/boundaries_${year}.geojson"
  
  # 转换为 GeoJSON
  ogr2ogr -f GeoJSON "$output" "$shp_file"
  
  # 添加时间属性（使用 jq）
  jq --arg year "$year" \
    '(.features[] | .properties) |= . + {"valid_from": ($year | tonumber), "valid_to": ($year | tonumber)}' \
    "$output" > "${output}.tmp" && mv "${output}.tmp" "$output"
  
  # 验证
  jq empty "$output" && echo "✓ $output is valid"
done
```

### 3.3 使用 Tippecanoe 生成矢量瓦片

**`data/scripts/generate_tiles.sh`**
```bash
#!/bin/bash
# 生成矢量瓦片（MBTiles 格式）

# 合并所有时期的 GeoJSON
jq -s '[.[]|.features[]]|{type:"FeatureCollection",features:.}' \
  data/processed/boundaries_*.geojson > data/processed/boundaries_all.geojson

# 生成 MBTiles（注：保留时间属性用于过滤）
tippecanoe \
  -o data/tiles/boundaries.mbtiles \
  -z 4 -Z 2 \
  -l boundaries \
  --drop-densest-as-needed \
  data/processed/boundaries_all.geojson

# 导出为静态切片目录（用于 CDN）
mb-util data/tiles/boundaries.mbtiles data/tiles/web_tiles/

echo "✓ Tiles generated in data/tiles/"
```

### 3.4 验证数据质量

**`data/scripts/validate_geojson.js`**
```javascript
const fs = require('fs');
const path = require('path');

const dir = 'data/processed';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.geojson'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // 检查结构
    if (data.type !== 'FeatureCollection') {
      console.warn(`❌ ${file}: Invalid GeoJSON type`);
      return;
    }

    // 检查几何有效性
    let validGeometries = 0;
    data.features.forEach((feature, idx) => {
      const coords = feature.geometry?.coordinates;
      if (!coords) {
        console.warn(`⚠️  ${file} feature ${idx}: Missing coordinates`);
      } else {
        validGeometries++;
      }
    });

    console.log(`✓ ${file}: ${validGeometries}/${data.features.length} valid geometries`);
  } catch (err) {
    console.error(`❌ ${file}: ${err.message}`);
  }
});
```

运行验证：
```bash
node data/scripts/validate_geojson.js
```

### 3.5 CDN 与对象存储配置

**云服务选择**：
- AWS S3 + CloudFront（国际）
- 阿里 OSS + CDN（中国大陆）
- 腾讯 COS + CDN（中国大陆）

**示例（AWS S3）**：
```bash
# 创建 S3 bucket
aws s3 mb s3://china-historical-tiles

# 上传瓦片
aws s3 cp data/tiles/web_tiles/ s3://china-historical-tiles/ --recursive --acl public-read

# 配置 CloudFront 分布
# https://console.aws.amazon.com/cloudfront/
# 源: s3://china-historical-tiles
# 缓存：24 小时
```

### 3.6 检查清单

- [ ] CHGIS 数据已下载并解压
- [ ] Shapefile 已转换为 GeoJSON
- [ ] 时间属性已添加到所有特征
- [ ] GeoJSON 已通过验证
- [ ] 矢量瓦片（MBTiles）已生成
- [ ] 瓦片已上传到 CDN
- [ ] CDN 缓存策略已配置
- [ ] 代码与脚本已提交到 `feat/gis-pipeline` 分支

---

## 阶段 4：CI/CD 与部署（第 8 周）

### 周期目标
- ✅ GitHub Actions workflow 配置
- ✅ 自动化测试与构建
- ✅ 前端部署到 Netlify/Vercel
- ✅ 后端部署到 Render/DigitalOcean
- ✅ 演示站点上线

### 4.1 前端 CI/CD（`.github/workflows/frontend-deploy.yml`）

```yaml
name: Frontend Deploy

on:
  push:
    branches: [main, develop]
    paths: ['frontend/**']
  pull_request:
    branches: [main, develop]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Lint
        working-directory: ./frontend
        run: npm run lint

      - name: Build
        working-directory: ./frontend
        run: npm run build

      - name: Deploy to Netlify
        uses: netlify/actions/build@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: './frontend/dist'
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
```

### 4.2 后端 CI/CD（`.github/workflows/backend-deploy.yml`）

```yaml
name: Backend Deploy

on:
  push:
    branches: [main, develop]
    paths: ['backend/**']

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgis/postgis:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: history_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run migrations
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test:test@localhost/history_test
        run: npx prisma migrate deploy

      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test:test@localhost/history_test
        run: npm test

      - name: Build Docker image
        run: |
          docker build -t ghcr.io/your-org/history-api:${{ github.sha }} ./backend
          docker push ghcr.io/your-org/history-api:${{ github.sha }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }} \
            -H "Content-Type: application/json" \
            -d '{"image": "ghcr.io/your-org/history-api:${{ github.sha }}"}'
```

### 4.3 检查清单

- [ ] GitHub Actions workflows 已创建
- [ ] 自动化测试已配置并通过
- [ ] 前端已部署到 Netlify/Vercel
- [ ] 后端已部署到 Render/自托管
- [ ] 数据库已配置（生产环境）
- [ ] 环境变量已设置
- [ ] 演示站点可访问
- [ ] 所有功能已测试

---

## 开发者工具链与检查清单

### 必需工具

```bash
# Node.js 与包管理
node --version  # >= 16
npm --version   # >= 8

# 数据库
psql --version  # >= 12
ogr2ogr --version  # GDAL

# 地图工具
tippecanoe --version

# Docker（可选）
docker --version
docker-compose --version
```

### 安装脚本（macOS / Linux）

```bash
#!/bin/bash

# 更新包管理器
brew update

# 安装 Node.js
brew install node@18

# 安装 PostgreSQL + PostGIS
brew install postgresql postgis

# 安装 GDAL
brew install gdal

# 安装 Tippecanoe
brew install tippecanoe

echo "✓ All tools installed!"
```

### 本地开发工作流

```bash
# 1. 启动开发环境
docker-compose up -d

# 2. 运行后端
cd backend
npm install
npm run dev

# 3. 在新终端运行前端
cd frontend
npm install
npm run dev

# 4. 访问
# 前端: http://localhost:5173
# 后端 API: http://localhost:3000/api
# API 文档: http://localhost:3000/api/docs
```

### 常见命令速查表

| 任务 | 命令 |
|------|------|
| 数据库迁移 | `npx prisma migrate dev` |
| 生成 Prisma 客户端 | `npx prisma generate` |
| 查看数据库 UI | `npx prisma studio` |
| 运行测试 | `npm test` |
| 代码检查 | `npm run lint` |
| 代码格式化 | `npm run format` |
| 构建生产版本 | `npm run build` |
| 生成瓦片 | `bash data/scripts/generate_tiles.sh` |

---

## 最后的话

该实施指南涵盖了从数据库到前端再到部署的完整开发周期。每个阶段都可以并行进行，建议：

1. **第 1-2 周**: 后端与数据库设计（任务 2-3）
2. **第 3-4 周**: 并行进行前端开发（任务 4）
3. **第 5-6 周**: GIS 数据管线（任务 5）
4. **第 7-8 周**: CI/CD 与部署（任务 6）
5. **第 8-9 周**: 社区治理与发布（任务 7）

**祝开发顺利！** 🚀

---

*最后更新: 2025-12-13*  
*版本: 1.0*
