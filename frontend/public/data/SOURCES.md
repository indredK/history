# 数据来源与属性说明 (Data Sources & Attribution)

**最后更新**: 2025-12-13

---

## 目录

1. [数据来源总览](#数据来源总览)
2. [按实体类型的来源](#按实体类型的来源)
3. [学术与官方来源](#学术与官方来源)
4. [数据质量等级](#数据质量等级)
5. [贡献指南](#贡献指南)

---

## 数据来源总览

本项目采用多源数据融合策略，所有数据均带有明确的来源和许可信息：

| 来源 | 数据类型 | 许可证 | 信任度 | 数据量 |
|------|--------|--------|--------|--------|
| 《史记》 | 人物、事件 | CC0/PD | 0.95 | ~50条 |
| 《资治通鉴》 | 事件、人物关系 | CC0/PD | 0.90 | ~40条 |
| CHGIS v6.0 | 地点、行政单元、边界 | CC-BY-4.0 | 0.95 | ~100条 |
| 旧唐书 | 唐代人物、事件 | CC0/PD | 0.90 | ~30条 |
| 宋史、元史、明史、清史稿 | 各朝代数据 | CC0/PD | 0.90 | ~80条 |
| 民国人物传记 | 民国时期数据 | CC-BY-4.0 | 0.85 | ~20条 |
| 中国共产党历史 | 现代历史 | CC0/PD | 0.95 | ~15条 |
| 日本战国、江户历史 | 东亚比较数据 | CC-BY-4.0 | 0.80 | ~10条 |

---

## 按实体类型的来源

### Persons（历史人物）

**数据收集方式**:
- 主要来源：《史记》《二十四史》
- 学术补充：各领域专史（如《唐宋文化史》等）
- 数据格式：
  - `name`: 中文标准名字
  - `name_en`: 英文拼音/Wade-Giles 标准化
  - `birth_year`: BC 用负数（如秦始皇 -259）
  - `roles`: 多个角色用逗号分隔
  - `source`: 原始出处

**示例**:
```csv
秦始皇,Qin Shi Huang,-259,12,-210,9,"emperor,military_leader,reformer","...",史记
```

**质量保证**:
- 所有人物都需要明确的历史来源
- 生卒年份需要在至少两个历史文献中得到验证
- 信任度 < 0.8 需要在 biography 中标注"存争议"或"推测"

---

### Events（历史事件）

**数据收集方式**:
- 核心来源：《资治通鉴》《史记》各朝代纪传
- 年份确认：采用复数来源交叉验证
- 数据格式：
  - `start_year` / `end_year`: 确切年份（农历转换已完成）
  - `event_type`: 必须从预定义列表选择
  - `locations`: 事件相关地点（逗号分隔）
  - `participants`: 主要参与人物（逗号分隔）

**预定义事件类型**:
- `war`: 战争/军事行动
- `diplomacy`: 外交事件
- `culture`: 文化活动/科技进步
- `disaster`: 自然灾害
- `reform`: 改革运动
- `peasant_uprising`: 农民起义
- `rebellion`: 反叛
- `political_event`: 政治变动

**示例**:
```csv
安史之乱,An Lushan Rebellion,755,12,763,2,"war,civil_war","安禄山和史思明在唐玄宗统治时期发动的大规模叛乱...","洛阳, 长安, 范阳","安禄山, 唐玄宗, 郭子仪",《资治通鉴》
```

---

### Places（地点）

**数据收集方式**:
- 来源：CHGIS v6.0（Harvard 数据库）+ 补充地名研究
- 坐标系统：WGS84 (EPSG:4326)
- 数据格式：
  - `canonical_name`: 现代标准地名
  - `alt_names`: 历史别名（分号分隔）
  - `latitude` / `longitude`: WGS84 坐标
  - `source`: CHGIS / 地名研究

**CHGIS 数据引用**:

Bol, P. K., Hsiao, C. C., & Oki, N. (2020). CHGIS, Version 6. Harvard University.  
https://doi.org/10.7910/DVN/XBK9PJ

**坐标精度说明**:
- 0.9+ 的置信度: 考古确认或多源一致
- 0.8-0.9: 多个历史文献参考
- <0.8: 推理得出或存在争议，需标注

---

### AdminUnits（行政单元）& MapBoundaryVersions（边界）

**数据来源**:
- 官方：CHGIS 边界数据集
- 补充：各朝代地方志、《全史网络地图库》
- 时间覆盖：BC 2070 年（夏代）至 AD 1911 年

**数据约定**:
1. `valid_from` / `valid_to`: 行政单元的有效期
   - 例：唐帝国 valid_from=618, valid_to=907
   - NULL valid_to 表示持续至今

2. 边界数据格式：GeoJSON FeatureCollection
   - 每个 Feature 代表一个时间点的完整边界
   - properties 包含：
     - `name`: 行政单元名称
     - `year`: 该边界有效的标准年份
     - `source`: 数据来源

**示例目录结构**:
```
data/raw/
  ├── boundaries_tang.geojson      # 唐代疆域及省级行政区 (618-907)
  ├── boundaries_song.geojson      # 宋代疆域及省级行政区 (960-1279)
  ├── boundaries_ming.geojson      # 明代疆域及省级行政区 (1368-1644)
  └── boundaries_qing.geojson      # 清代疆域及省级行政区 (1644-1911)
```

---

## 学术与官方来源

### 主要中文历史文献

| 文献 | 时代 | 作者 | 许可证 | 备注 |
|------|------|------|--------|------|
| 《史记》 | 秦汉 | 司马迁 | CC0/PD | 中国第一部纪传体通史 |
| 《汉书》 | 汉代 | 班固 | CC0/PD | 专记汉朝的历史 |
| 《三国志》 | 三国 | 陈寿 | CC0/PD | 记载三国时期历史 |
| 《资治通鉴》 | 全朝代 | 司马光 | CC0/PD | 编年体通史，1000 年分析 |
| 《旧唐书》 | 唐代 | 刘昫等 | CC0/PD | 官修正史 |
| 《新唐书》 | 唐代 | 欧阳修等 | CC0/PD | 改撰版本 |
| 《宋史》 | 宋代 | 脱脱等 | CC0/PD | 官修正史 |
| 《元史》 | 元代 | 宋濂等 | CC0/PD | 官修正史 |
| 《明史》 | 明代 | 张廷玉等 | CC0/PD | 官修正史 |
| 《清史稿》 | 清代 | 赵尔巽等 | CC0/PD | 民国时编撰 |

### 国际数据库与学术项目

| 来源 | 机构 | 覆盖范围 | 许可证 | URL |
|------|------|--------|--------|-----|
| CHGIS | Harvard University | BC 2070-AD 1911 | CC-BY-4.0 | https://chgis.harvard.edu |
| OpenHistoricalMap | 众包项目 | 全球历史 | CC-BY-SA | https://www.openhistoricalmap.org |
| 全球历史地图库 | 美国国会图书馆 | 全球历史地图 | CC0 | https://maps.loc.gov |

---

## 数据质量等级

### 质量评分标准

```
置信度 (confidence): 0.0 - 1.0
  
  0.95+ : 🟩  极高置信度
    ├─ 学术出版物直接引用
    ├─ 多个独立来源一致验证
    └─ 例: CHGIS 坐标、司马迁《史记》人物年份

  0.80-0.95 : 🟨 高置信度
    ├─ 可信学术来源
    ├─ 官修正史记载
    └─ 例: 各朝代史书中的人物、事件

  0.50-0.80 : 🟧 中等置信度
    ├─ 二级学术来源
    ├─ 民间文献或推理
    └─ 需标注"存争议"或"推断"

  <0.50 : 🟥 低置信度
    ├─ 猜测或高度推理
    └─ 需在 biography/description 中明确说明

```

### 贡献者标注

所有数据贡献者都应在 `contributors` 字段中标注 GitHub 用户名：

```json
{
  "id": "per_秦始皇",
  "name": "秦始皇",
  "contributors": ["user1", "user2"]
}
```

---

## 贡献指南

### 新增人物数据

**步骤**:
1. 从 [persons.csv](./persons.csv) 复制模板
2. 填写必填字段：name, birth_year, death_year, source
3. 核实信息来源（需要可验证的学术文献）
4. 在 biography 中标注信息来源
5. 提交 PR，会由数据审核员验证

**模板**:
```csv
名字,English Name,出生年,出生月,去世年,去世月,身份标签,传记,来源
```

### 新增事件数据

**步骤**:
1. 确认事件的 start_year 和 end_year（需两个来源验证）
2. 从预定义 event_type 列表中选择
3. 添加 locations 和 participants（指向已有的地点和人物）
4. 提供来源引用（可以是学术著作或可靠网页）
5. 如果事件年份存在学术争议，在 description 中说明

### 新增地点数据

**步骤**:
1. 使用 WGS84 坐标系统 (EPSG:4326)
2. 从 CHGIS 或可信地理数据源获取坐标
3. 列出所有历史别名
4. 标注信任度分数

**坐标校验**:
```bash
# 快速检查坐标范围
node data/scripts/validate_data.js
```

### 新增边界数据

**要求**:
1. GeoJSON 格式，必须有效
2. 包含 properties:
   - `name`: 地政单元名称
   - `year`: 该边界有效的年份
   - `source`: 来源（通常是 CHGIS）
3. 坐标系统必须是 WGS84
4. 简化度不低于 1 arcsecond（约 30 米）

**示例**:
```geojson
{
  "type": "Feature",
  "id": "tang_core",
  "properties": {
    "name": "唐帝国",
    "year": 700,
    "source": "CHGIS"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

---

## 许可证速查表

| 许可证 | 使用场景 | 修改 | 商用 | 署名 | 传播 |
|--------|---------|------|------|------|------|
| CC0 | 放弃所有权 | ✓ | ✓ | - | ✓ |
| CC-BY-4.0 | 标准开放 | ✓ | ✓ | ✓ | ✓ |
| CC-BY-SA-4.0 | 开放但传播需同许可 | ✓ | ✓ | ✓ | ✓ |
| PD (Public Domain) | 古籍、已过期 | ✓ | ✓ | - | ✓ |

---

## 常见问题

### Q: 我如何获得 CHGIS 数据的使用权限？
A: CHGIS v6.0 已发布到 Harvard Dataverse，采用 CC-BY-4.0 许可证。你可以直接下载使用，只需要在使用时标注来源。

### Q: 两个来源对同一事件的年份不一致怎么办？
A: 在 description 中注明两个版本，并在 confidence 中选择较保守的评分。鼓励提交 issue 讨论。

### Q: 我可以添加来自维基百科的数据吗？
A: 维基百科本身是 CC-BY-SA-3.0，可以使用，但需要明确标注来源为"Wikipedia"，信任度应该 ≤ 0.75。

### Q: 我发现了数据错误，怎样报告？
A: 提交 issue，标签为 `data-quality` 或 `bug`。提供正确的来源和证据。

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2025-12-13 | 初始版本，包含 300+ 条样例数据和来源说明 |

---

**相关文档**:
- [DATA_MODEL.md](./DATA_MODEL.md) - 数据模型设计
- [../IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) - 技术实现
- [../DATA_LICENSE.md](../DATA_LICENSE.md) - 完整许可规范
