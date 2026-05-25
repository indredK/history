# 中国历史全视界 - 路线图

> 项目愿景:多维度的中国历史信息可视化平台,核心是基于时间轴的中国疆域、行政区划动态演变(Historical GIS)
>
> 状态:2026-05-26 更新

---

## 项目现状

- **后端**:NestJS + Prisma + SQLite
  - 原计划 PostgreSQL + PostGIS,实际选 SQLite 简化部署;GIS 功能在前端用 GeoJSON + MapLibre/Deck.gl 实现
- **前端**:React 19 + Vite 8 + MUI v9 + Zustand + MapLibre GL + Deck.gl + Three.js
- **部署**:GitHub Pages(前端) + 后端待生产部署
- **数据**:CHGIS v6.0 边界数据已就绪 10 个朝代的 GeoJSON(秦/汉/三国/晋/隋/唐/宋/元/明/清)

## 已完成里程碑

| 里程碑 | 完成度 | 备注 |
|---|---|---|
| 仓库初始化 | 80% | LICENSE(MIT) / README / 基础结构 ✅;治理文档缺失 |
| 后端服务搭建 | 70% | NestJS + Prisma + Swagger + CI 测试齐备;单测覆盖率 <5%,无认证 |
| 前端原型 | 85% | 时间轴 / 朝代轮播 / 地图 / 人物详情 / 路由懒加载 + ErrorBoundary 已完成 |
| GIS 数据采集 | 50% | 10 朝代 GeoJSON 已就绪;矢量瓦片(MBTiles)管线未建,直接由前端加载 GeoJSON |
| CI/CD 基础 | 60% | GitHub Pages 自动部署、CI 跑前后端 lint + test;容器化 / Sentry / 监控未做 |

详细架构进度见 [ARCHITECTURE_ISSUES.md](./ARCHITECTURE_ISSUES.md)。

---

## 剩余里程碑

### M1 治理文档补全
- [ ] `CONTRIBUTING.md`(开发者上手指南、PR 流程、数据贡献指南)
- [ ] `CODE_OF_CONDUCT.md`
- [ ] `CHANGELOG.md`(语义化版本)
- [ ] `.github/ISSUE_TEMPLATE/`(bug / feature / data)
- [ ] `.github/pull_request_template.md`
- [ ] `.github/dependabot.yml`(自动依赖更新)
- [ ] 分支策略文档(main / develop / feature/*)

### M2 后端能力补强
- [ ] 认证体系(JWT 或 OAuth 2.0,Swagger Bearer scheme `JWT-auth` 已注册)
- [ ] `@nestjs/throttler` 速率限制
- [ ] `helmet` 安全头
- [ ] `pino` 结构化日志 + request-id
- [ ] 后端单元/集成测试覆盖率提升至 50%+
- [ ] `test/app.e2e-spec.ts` 模板填充
- [ ] `dev.db` 剥离 + `prisma/seed.ts`(详见 ARCHITECTURE_ISSUES.md §3.3)

### M3 数据模型重构
- [ ] Figure 表合并为 `HistoricalFigure` + `dynastyId`(消除 6 张雷同表)
- [ ] JSON 字段拆为关系表(`eraNames` / `works` / `policies` 等)
- [ ] 前后端类型同步(openapi-generator 或 orval)

### M4 GIS 完善
- [ ] 矢量瓦片管线(Tippecanoe → MBTiles)
- [ ] 瓦片 CDN 发布(S3/OSS + tileserver-gl 或纯静态 CDN)
- [ ] CHGIS 数据补全更多朝代/年份
- [ ] 时间维度切片(支持按年过滤,而非按朝代)
- [ ] 人工校准(QGIS + MapWarper)关键历史时期边界

### M5 前端能力补强
- [ ] 20 个 Zustand store 合并为 4 个(详见 ARCHITECTURE_ISSUES.md §2.1)
- [ ] 真正 404 页面 + 路由守卫(配合 M2 认证)
- [ ] 单元/交互测试补全(19 个空 describe 文件)
- [ ] PWA + 离线支持(可选)

### M6 部署与监控
- [ ] 后端容器化(Dockerfile + docker-compose)
- [ ] 后端生产部署(Render / DigitalOcean / 自托管)
- [ ] Sentry 集成(前后端错误追踪)
- [ ] 性能监控(可选 Prometheus / Grafana)
- [ ] 自定义域名 + HTTPS 证书

### M7 社区治理
- [ ] GitHub Discussions 启用
- [ ] 第三方资源归属声明文件(CHGIS / OpenHistoricalMap 等)
- [ ] 数据许可分离(代码 MIT,数据 CC-BY-4.0,单独 `DATA_LICENSE`)
- [ ] `good-first-issue` / `help-wanted` 标签梳理
- [ ] 发布计划(语义化版本 + 里程碑节奏)

---

## 备注

- 任务可并行推进,M1 / M2 优先级最高
- 阻塞项见 ARCHITECTURE_ISSUES.md 末尾"需要装包权限的项目"
- 技术栈与原计划差异:
  - ✅ React + TypeScript / MapLibre GL + Deck.gl:与计划一致
  - ⚠️ NestJS:计划备选 FastAPI / NestJS,实际选 NestJS
  - ❌ PostgreSQL + PostGIS:实际用 SQLite,GIS 在前端实现
  - ❌ Docker Compose / Tippecanoe + MBTiles:未建立
