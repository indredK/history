# 中国历史全视界 (Chinese Historical Panorama) - 开发路线图

## 项目愿景
构建一个多维度的中国历史信息可视化平台，支持按时间轴、历史事件、历史人物、地点等维度进行数据的筛选和关联展示。核心创新是实现基于时间轴的中国疆域、行政区划的动态演变（Historical GIS），并通过开源协作不断完善数据与功能。

---

## 里程碑与任务清单

### 🔄 进行中

#### [1] 初始化 GitHub 仓库与基础文档
**目标**: 建立项目基础架构与治理框架  
**预计耗时**: 2-3 天  
**核心任务**:
- [x] 建立 GitHub 仓库
- [ ] 编写 `README.md`（项目简介、快速开始、架构概览）
- [ ] 编写 `LICENSE`（代码采用 MIT，数据采用 CC-BY-4.0）
- [ ] 编写 `CONTRIBUTING.md`（开发者上手指南、代码风格、PR 流程）
- [ ] 编写 `CODE_OF_CONDUCT.md`（社区行为准则）
- [ ] 创建 Issue/PR 模板（BUG、FEATURE、DOCUMENTATION）
- [ ] 配置分支策略（main / develop / feature/*）

**交付物**: 项目基础仓库结构、所有必需的治理文档

---

### 📋 待开始

#### [2] 设计数据模型与准备样例数据
**目标**: 完成数据架构设计，准备第一批种子数据用于演示  
**预计耗时**: 3-5 天  
**核心任务**:
- [ ] 绘制 ER 图（实体：Person、Event、Place、AdminUnit、MapBoundaryVersion、Source）
- [ ] 编写 PostGIS 表结构定义（DDL）
- [ ] 准备样例数据集
  - 50+ 条历史事件（JSON/CSV）
  - 20+ 历史人物（JSON/CSV）
  - 1-2 个时代的疆域边界（GeoJSON）
  - 源引用与许可信息
- [ ] 编写数据导入脚本（PostgreSQL 初始化）
- [ ] 建立数据版本管理策略（DVC / Git LFS）
- [ ] 编写 `docs/DATA_MODEL.md` 与 `docs/SCHEMA.md`

**交付物**: ER 图、DDL 脚本、样例数据集、DVC/LFS 配置

---

#### [3] 搭建后端服务与 PostGIS 数据库
**目标**: 建立 API 层与数据持久化层  
**预计耗时**: 1 周  
**核心任务**:
- [ ] 初始化后端项目（Node.js + FastAPI / NestJS）
- [ ] 配置 PostgreSQL + PostGIS 环境（本地开发 + Docker Compose）
- [ ] 实现基础 CRUD API
  - Person（人物）: GET /persons, GET /persons/:id, POST, PATCH, DELETE
  - Event（事件）: GET /events, GET /events/:id, POST, PATCH, DELETE
  - Place（地点）: GET /places, GET /places/:id, POST, PATCH, DELETE
- [ ] 实现搜索与过滤
  - 按时间范围查询事件
  - 按地点查询（包括地理空间查询）
  - 按人物/事件类型过滤
- [ ] 实现关联查询（人物参与的事件、事件发生的地点等）
- [ ] 编写数据库初始化与迁移脚本
- [ ] 添加单元测试与集成测试
- [ ] 配置环境变量与日志系统

**交付物**: 可运行的后端服务、API 文档（Swagger）、Docker Compose 配置

---

#### [4] 实现前端原型：时间轴 + 历史地图
**目标**: 打造交互式多维可视化演示  
**预计耗时**: 1-2 周  
**核心任务**:
- [ ] 初始化前端项目（React + TypeScript）
- [ ] 集成地图库（MapLibre GL + Deck.gl）
- [ ] 实现时间轴组件
  - 可拖动的时间点/范围选择
  - 与地图/事件列表联动
  - 支持年代跳转（秦汉唐宋明清）
- [ ] 实现地图视图
  - 加载并渲染疆域边界（GeoJSON）
  - 显示事件位置点
  - 支持图层切换与透明度控制
  - 支持基本的缩放、平移、选择
- [ ] 实现事件/人物列表视图
  - 事件卡片展示（含日期、地点、参与人物、简述）
  - 人物卡片展示（含生卒年、主要事迹）
  - 列表项点击跳转到详情页
- [ ] 实现三向联动
  - 时间轴变化 → 过滤/高亮地图与列表
  - 列表项点击 → 跳转到时间轴位置并高亮地图
  - 地图点击 → 显示关联事件/人物
- [ ] 实现详情页与数据引用
  - 事件详情页：完整描述、参与人物、发生地点、来源出处（带链接）
  - 人物详情页：传记、生卒年、主要事件、来源
  - 支持"数据导出"（JSON/GeoJSON）按钮
- [ ] 基础响应式设计（桌面优先）
- [ ] 集成 API（从后端拉取数据）

**交付物**: 可交互的前端演示站点、开发文档、组件库说明

---

#### [5] 历史 GIS 数据管线：采集、清洗、瓦片生成
**目标**: 建立数据处理流程，生成可交付的矢量瓦片  
**预计耗时**: 2 周  
**核心任务**:
- [ ] 数据采集
  - 整合 CHGIS（中国历史地理信息系统）数据
  - 收集 OpenHistoricalMap 相关数据
  - 列出待补数据（人工数字化候选项）
- [ ] 数据清洗与标准化
  - 统一坐标参考系（EPSG:4326）
  - 添加时间有效性标记（valid_from, valid_to）
  - 验证几何有效性
- [ ] 人工校准（QGIS + MapWarper）
  - 对 1-2 张关键历史时期的边界进行配准与矢量化
- [ ] 矢量瓦片生成
  - 使用 Tippecanoe 从 GeoJSON 生成 MBTiles
  - 生成多个时代/朝代的分组切片
  - 或生成支持时间过滤的单一矢量瓦片集
- [ ] 瓦片发布
  - 配置对象存储（S3/OSS）与 CDN
  - 配置 tileserver-gl 或直接由 CDN 提供静态瓦片
- [ ] 编写数据处理文档与工具链
  - 处理脚本（GDAL/ogr2ogr/Tippecanoe 命令）
  - QGIS 项目文件示例
  - README：新贡献者如何添加数据

**交付物**: 可用的矢量瓦片文件、瓦片管理与发布文档、处理脚本库

---

#### [6] CI/CD 与演示站点部署（GitHub Actions）
**目标**: 实现自动化构建、测试与部署流程  
**预计耗时**: 3-5 天  
**核心任务**:
- [ ] 配置 GitHub Actions workflows
  - 前端：push 到 main → npm ci → npm run build → deploy to Netlify/GitHub Pages
  - 后端：push 到 main → npm test → build Docker image → push to container registry
  - 瓦片：合并包含地图数据的 PR → 触发 Tippecanoe 生成 MBTiles → 上传到 S3/CDN
- [ ] 前端部署配置
  - 部署到 Netlify / Vercel / GitHub Pages
  - 配置自定义域名与 HTTPS
- [ ] 后端部署配置
  - Docker 镜像构建与推送
  - 部署目标（Render / DigitalOcean / 自托管）
  - 配置环境变量、数据库连接
  - 运行数据库迁移脚本
- [ ] 瓦片 CDN 集成
  - S3/OSS 对象存储配置
  - CDN 缓存策略
  - 自动化瓦片更新与缓存刷新
- [ ] 监控与日志
  - Sentry 集成（错误追踪）
  - Prometheus / Grafana（可选）
- [ ] 编写部署文档
  - `docs/DEPLOYMENT.md`：本地开发、演示站点、生产部署步骤

**交付物**: 可工作的 CI/CD pipelines、演示站点上线、部署文档

---

#### [7] 开源治理与社区贡献规范制定
**目标**: 建立长期可持续的社区贡献机制  
**预计耗时**: 1-2 周（初期）  
**核心任务**:
- [ ] 完善 `CONTRIBUTING.md`
  - 开发环境设置指南
  - 代码风格与规范（Linting、Prettier、ESLint 配置）
  - PR 审查流程与期望
  - 数据贡献指南（如何添加新事件、人物、地图）
- [ ] 建立 Issue 分类与标签系统
  - `good-first-issue`: 适合新手
  - `help-wanted`: 需要外部贡献
  - `bug`, `feature`, `documentation`, `data`
  - `priority: high/medium/low`
- [ ] 制定发布计划
  - 语义化版本管理（MAJOR.MINOR.PATCH）
  - 里程碑与发布周期（如 v0.1、v0.2 等）
  - `CHANGELOG.md` 维护
- [ ] 许可与数据归属
  - 代码许可：MIT
  - 数据许可：CC-BY-4.0（确保署名）
  - 第三方资源清单（CHGIS、OpenHistoricalMap 等归属）
- [ ] 社区沟通频道
  - GitHub Discussions 启用
  - 定期同步会议或 Roadmap 评审
- [ ] 编写 `SECURITY.md`（安全漏洞上报流程）
- [ ] 编写 `ROADMAP.md`（此文件：长期规划可视化）

**交付物**: 完整的社区治理文档、标签与工作流规范、长期 Roadmap

---

## 阶段目标

### Phase 0: MVP（最小可行产品）
- 完成任务 1-4
- 目标：可交互的演示站点（静态数据），支持时间轴、地图、事件列表三维联动
- 预计时间表：4-6 周

### Phase 1: 数据与性能
- 完成任务 5-6
- 目标：生产级数据管线、自动化部署、矢量瓦片优化
- 预计时间表：接续 2-3 周

### Phase 2: 社区与扩展
- 完成任务 7 + 后续迭代
- 目标：建立活跃社区、支持用户数据贡献、地区与主题扩展
- 预计时间表：持续演进

---

## 快速参考

| 任务 | 状态 | 责任人 | ETA |
|------|------|--------|-----|
| 初始化仓库与基础文档 | 🔄 进行中 | - | 2025-12-16 |
| 数据模型设计 | ⏳ 待开始 | - | 2025-12-19 |
| 后端搭建 | ⏳ 待开始 | - | 2025-12-26 |
| 前端原型 | ⏳ 待开始 | - | 2026-01-09 |
| GIS 数据管线 | ⏳ 待开始 | - | 2026-01-23 |
| CI/CD 部署 | ⏳ 待开始 | - | 2026-01-28 |
| 社区治理 | ⏳ 待开始 | - | 2026-02-04 |

---

## 备注

- 所有任务可并行推进（例如后端与前端同时开发）。
- 数据采集与处理贯穿全过程，优先级可调整。
- 欢迎贡献者认领任务并提交 PR；详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。
