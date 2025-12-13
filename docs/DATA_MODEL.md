# 数据模型设计 (Data Model Design)

**版本**: 1.0  
**最后更新**: 2025-12-13  
**设计者**: 数据架构师

---

## 目录

1. [概述](#概述)
2. [实体关系图](#实体关系图)
3. [核心实体详解](#核心实体详解)
4. [关联关系](#关联关系)
5. [时间与版本管理](#时间与版本管理)
6. [数据完整性约束](#数据完整性约束)

---

## 概述

本项目的数据模型支持复杂的历史信息查询与关联。核心设计原则：

- **多维度关联**: 事件与人物、地点、时间的灵活关联
- **时间有效性**: 每条数据都包含有效期，支持历史演变查询
- **可信度评分**: 数据来源与信任度明确标记
- **学术追踪**: 完整的来源引用与署名管理
- **版本管理**: 支持数据更新与历史演变的完整记录

---

## 实体关系图

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Sources   │────────▶│   Persons    │◀────────│   Events    │
│  (来源)     │         │  (人物)      │         │  (事件)     │
└─────────────┘         └──────────────┘         └─────────────┘
                               △                         △
                               │                         │
                        ┌──────┼─────────┐      ┌────────┼──────────┐
                        │      │         │      │        │          │
                   EventParticipant     │      │   EventLocation    │
                   (事件-人物关联)       │      │   (事件-地点关联)  │
                                        │      │                    │
                        ┌───────────────┘      └────────────────────┘
                        │
                   ┌─────▼──────┐
                   │   Places   │
                   │  (地点)    │
                   └────────────┘

┌───────────────┐      ┌──────────────────────┐      ┌───────────────┐
│  AdminUnits   │◀─────│ AdminUnitBoundaries  │─────▶│ MapBoundary   │
│ (行政单元)   │      │   (关联表)           │      │ Versions      │
└───────────────┘      └──────────────────────┘      │ (地图版本)   │
                                                     └───────────────┘
```

---

## 核心实体详解

### 1. Sources (来源)

**用途**: 追踪所有数据的原始来源，支持学术引用与数据可信度评估

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✓ | 唯一标识 |
| title | String | ✓ | 来源标题（如《资治通鉴》、CHGIS v6.0） |
| author | String | - | 作者或机构名称 |
| url | URL | - | 来源网址或 DOI |
| accessed_date | Date | - | 访问或收录日期 |
| license | String | - | 许可证（CC-BY-4.0, PD, CC0 等） |
| confidence | Decimal(0-1) | ✓ | 数据可信度分数（默认 0.8） |
| created_at | Timestamp | ✓ | 记录创建时间 |
| updated_at | Timestamp | ✓ | 最后更新时间 |

**示例**:
```json
{
  "id": "src_史记",
  "title": "史记",
  "author": "司马迁",
  "license": "CC0",
  "confidence": 0.95,
  "accessed_date": "2025-12-01"
}
```

---

### 2. Persons (历史人物)

**用途**: 存储历史人物的基本信息与生平

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✓ | 唯一标识（如 per_秦始皇） |
| name | String | ✓ | 中文名字 |
| name_en | String | - | 英文名字 |
| birth_year | Integer | - | 出生年（BC 用负数） |
| birth_month | Integer | - | 出生月（1-12） |
| death_year | Integer | - | 去世年 |
| death_month | Integer | - | 去世月 |
| biography | Text | - | 传记简述（支持 Markdown） |
| roles | Array[String] | - | 身份标签（emperor, general, scholar 等） |
| source_ids | Array[UUID] | - | 参考来源 ID 列表 |
| confidence | Decimal(0-1) | ✓ | 数据可信度（默认 0.8） |
| contributors | Array[String] | - | 贡献者 GitHub 用户名 |
| created_at | Timestamp | ✓ | 创建时间 |
| updated_at | Timestamp | ✓ | 更新时间 |

**约束**: `birth_year <= death_year` 或 `death_year IS NULL`

**示例**:
```json
{
  "id": "per_秦始皇",
  "name": "秦始皇",
  "name_en": "Qin Shi Huang",
  "birth_year": -259,
  "death_year": -210,
  "biography": "中国历史上第一位皇帝...",
  "roles": ["emperor", "military_leader"],
  "source_ids": ["src_史记"],
  "contributors": ["user1"]
}
```

---

### 3. Events (历史事件)

**用途**: 记录具有时间与地点的历史事件

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✓ | 唯一标识（如 evt_秦末农民起义） |
| title | String | ✓ | 事件名称 |
| title_en | String | - | 英文名称 |
| start_year | Integer | ✓ | 开始年份 |
| start_month | Integer | - | 开始月份 |
| end_year | Integer | - | 结束年份（可能等于 start_year） |
| end_month | Integer | - | 结束月份 |
| description | Text | - | 事件描述（支持 Markdown） |
| event_type | String | - | 事件类型：war, diplomacy, culture, disaster, reform 等 |
| source_ids | Array[UUID] | - | 参考来源 |
| confidence | Decimal(0-1) | ✓ | 数据可信度 |
| contributors | Array[String] | - | 贡献者 |
| created_at | Timestamp | ✓ | 创建时间 |
| updated_at | Timestamp | ✓ | 更新时间 |

**约束**: `start_year <= end_year` 或 `end_year IS NULL`

**示例**:
```json
{
  "id": "evt_安史之乱",
  "title": "安史之乱",
  "title_en": "An Lushan Rebellion",
  "start_year": 755,
  "end_year": 763,
  "description": "唐玄宗统治后期，安禄山和史思明发动的大规模叛乱...",
  "event_type": "war",
  "source_ids": ["src_史记"],
  "contributors": ["user1"]
}
```

---

### 4. Places (地点/地名)

**用途**: 存储地理位置与历史地名信息

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✓ | 唯一标识（如 place_长安） |
| canonical_name | String | ✓ | 标准地名 |
| alt_names | Array[String] | - | 历史别名（如中山郡、恒州等） |
| description | Text | - | 地点描述 |
| location | Point(EPSG:4326) | - | WGS84 坐标点（经度, 纬度） |
| source_ids | Array[UUID] | - | 参考来源 |
| confidence | Decimal(0-1) | ✓ | 坐标准确度 |
| contributors | Array[String] | - | 贡献者 |
| created_at | Timestamp | ✓ | 创建时间 |
| updated_at | Timestamp | ✓ | 更新时间 |

**示例**:
```json
{
  "id": "place_长安",
  "canonical_name": "长安",
  "alt_names": ["京城", "镐京"],
  "description": "秦汉时期的都城...",
  "location": {
    "type": "Point",
    "coordinates": [108.95, 34.34]
  },
  "confidence": 0.9
}
```

---

### 5. AdminUnits (行政单元)

**用途**: 表示不同时期的朝代、省份、郡县等行政区划

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✓ | 唯一标识 |
| name | String | ✓ | 行政单元名称（如"大唐帝国"、"河南省"） |
| name_en | String | - | 英文名称 |
| type | String | ✓ | 行政等级：empire, province, prefecture, county 等 |
| parent_id | UUID | - | 上级行政单元 ID（如省的父为帝国） |
| valid_from | Integer | ✓ | 有效起始年份 |
| valid_to | Integer | - | 有效结束年份（NULL 表示至今） |
| source_ids | Array[UUID] | - | 参考来源 |
| confidence | Decimal(0-1) | ✓ | 可信度 |
| created_at | Timestamp | ✓ | 创建时间 |
| updated_at | Timestamp | ✓ | 更新时间 |

**树形关系**: 通过 `parent_id` 形成层级关系

**示例**:
```json
{
  "id": "admin_唐帝国",
  "name": "唐帝国",
  "type": "empire",
  "valid_from": 618,
  "valid_to": 907
}
```

---

### 6. MapBoundaryVersions (地图边界版本)

**用途**: 管理不同时期的地理边界数据（疆域、行政区划）

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✓ | 唯一标识 |
| name | String | - | 边界版本名称（如"唐代疆域"、"元代省级行政区") |
| valid_from | Integer | ✓ | 有效起始年份 |
| valid_to | Integer | - | 有效结束年份 |
| geometry_type | String | - | 几何格式：GeoJSON, TopoJSON, MVT 等 |
| geometry_url | String | - | 指向几何数据的 URL（S3/CDN 路径） |
| geometry_hash | String | - | SHA256 校验和（版本控制） |
| source_ids | Array[UUID] | - | 数据来源 |
| confidence | Decimal(0-1) | ✓ | 数据准确度 |
| contributors | Array[String] | - | 贡献者 |
| created_at | Timestamp | ✓ | 创建时间 |
| updated_at | Timestamp | ✓ | 更新时间 |

**示例**:
```json
{
  "id": "boundary_tang_620",
  "name": "唐代疆域 (620 年)",
  "valid_from": 620,
  "valid_to": 620,
  "geometry_type": "GeoJSON",
  "geometry_url": "s3://tiles/tang_620.geojson",
  "geometry_hash": "abc123def456...",
  "source_ids": ["src_CHGIS"]
}
```

---

## 关联关系

### EventParticipant (事件-人物关联)

**用途**: 表示人物在事件中的角色

**字段**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✓ | 关联 ID |
| event_id | UUID | ✓ | 事件 ID |
| person_id | UUID | ✓ | 人物 ID |
| role | String | - | 角色（主角、参与者、反对者、见证人等） |

**约束**: `UNIQUE(event_id, person_id)` - 同一事件中每个人物只能关联一次

**示例**:
```json
{
  "event_id": "evt_安史之乱",
  "person_id": "per_安禄山",
  "role": "主角"
}
```

---

### EventLocation (事件-地点关联)

**用途**: 表示事件发生的地点与角色

**字段**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✓ | 关联 ID |
| event_id | UUID | ✓ | 事件 ID |
| place_id | UUID | ✓ | 地点 ID |
| role | String | - | 角色（发生地、影响地、途经地、战场等） |

**约束**: `UNIQUE(event_id, place_id)`

**示例**:
```json
{
  "event_id": "evt_安史之乱",
  "place_id": "place_长安",
  "role": "发生地"
}
```

---

### AdminUnitBoundary (行政单元-边界关联)

**用途**: 将行政单元与具体的地理边界关联

**字段**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✓ | 关联 ID |
| admin_unit_id | UUID | ✓ | 行政单元 ID |
| boundary_version_id | UUID | ✓ | 地图边界版本 ID |

**约束**: `UNIQUE(admin_unit_id, boundary_version_id)`

---

## 时间与版本管理

### 时间范围查询示例

**场景**: 查询 755 年唐帝国的行政区划与边界

```sql
-- 获取 755 年有效的所有行政单元
SELECT * FROM admin_units 
WHERE valid_from <= 755 AND (valid_to IS NULL OR valid_to >= 755);

-- 获取 755 年的地图边界
SELECT * FROM map_boundary_versions
WHERE valid_from <= 755 AND (valid_to IS NULL OR valid_to >= 755);

-- 三表联合查询（获取行政单元及其对应的地理边界）
SELECT au.name, au.type, mbv.geometry_url
FROM admin_units au
JOIN admin_unit_boundaries aub ON au.id = aub.admin_unit_id
JOIN map_boundary_versions mbv ON aub.boundary_version_id = mbv.id
WHERE au.valid_from <= 755 AND (au.valid_to IS NULL OR au.valid_to >= 755);
```

---

## 数据完整性约束

### 业务规则

1. **事件时间约束**
   - `start_year <= end_year` 或 `end_year IS NULL`
   - 若 `start_month` 存在，则 `start_year` 必须存在

2. **人物生卒年约束**
   - `birth_year <= death_year` 或 `death_year IS NULL`
   - 若 `birth_month` 存在，则 `birth_year` 必须存在

3. **行政单元有效期约束**
   - `valid_from <= valid_to` 或 `valid_to IS NULL`
   - 不同版本的边界可能重叠（表示行政区划变化）

4. **可信度分数**
   - 范围: 0.0 - 1.0
   - 0.95+: 非常可信（学术资料、官方记录）
   - 0.8-0.95: 可信（一级学术来源）
   - 0.5-0.8: 中等信任（二级来源、民间文献）
   - <0.5: 低信任（推断、估计）

5. **来源追踪**
   - 每条重要数据都应有 `source_ids`
   - 来源应明确说明其许可证

---

## 索引策略

**性能优化**:

```sql
-- 常用查询索引
CREATE INDEX idx_persons_birth_year ON persons(birth_year);
CREATE INDEX idx_persons_death_year ON persons(death_year);
CREATE INDEX idx_events_start_year ON events(start_year);
CREATE INDEX idx_events_end_year ON events(end_year);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_admin_units_type ON admin_units(type);
CREATE INDEX idx_admin_units_valid_period ON admin_units(valid_from, valid_to);
CREATE INDEX idx_boundary_versions_period ON map_boundary_versions(valid_from, valid_to);

-- 关联查询索引
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_person ON event_participants(person_id);
CREATE INDEX idx_event_locations_event ON event_locations(event_id);
CREATE INDEX idx_event_locations_place ON event_locations(place_id);
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2025-12-13 | 初始版本，包含 9 个表、3 个关联表、完整约束设计 |

---

## 相关文档

- [SCHEMA.md](./SCHEMA.md) - 完整的 SQL DDL
- [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) - 实施细节
- [DATA_LICENSE.md](../DATA_LICENSE.md) - 数据许可规范
