# Changelog

本项目所有显著变更都会记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added
- M1 治理文档全套:`CONTRIBUTING.md` / `CODE_OF_CONDUCT.md` / `CHANGELOG.md`
- `.github/ISSUE_TEMPLATE/`:bug / feature / data_contribution / config
- `.github/pull_request_template.md`
- `.github/dependabot.yml`:自动依赖更新(npm + github-actions)
- Swagger Bearer 认证方案(`JWT-auth`),为后续 JWT 接入预留
- 路由级 ErrorBoundary 包裹所有路由
- HTTP 客户端错误分类与 transient retry(network/timeout/5xx 自动重试 2 次)
- `BaseFigureDetailModal` 公共组件(Tang/Song/Yuan/Ming/Sanguo 已收敛)
- `ARCHITECTURE_ISSUES.md`:架构剩余待办清单
- `frontend/src/pages/NotFoundPage.tsx`:真正的 404 页面,替代静默重定向
- `backend/test/app.e2e-spec.ts`:health + 404 冒烟测试(替代空白模板)
- `backend/scripts/export-db.ts`:一次性 dev.db → `prisma/seed-data/*.json` 导出器(15 张表 / 732 行,JSON 字段递归去转义)
- `backend/prisma/seed.ts`:幂等 seed,按 FK 顺序读取 seed-data 并 `upsert`
- `backend/prisma/seed-data/*.json`:版本化的初始数据(替代二进制 dev.db)
- `backend/prisma/migrations/20260526024505_align_figure_columns_with_schema/`:补齐 `tang/song/yuan/ming/qing/sanguo` 历史 `db push` 留下的 ~53 个未迁移列
- `.github/workflows/pr.yml`:PR 专用检查(Conventional Commits 标题校验 + 前后端 lint informational + concurrency cancel-in-progress)
- `.github/workflows/test.yml` 加 concurrency 配置,新 push 自动取消旧 run
- 核心 Service 单元测试(§1.6 起步):
  - `backend/src/dynasty/dynasty.service.spec.ts`(7 个用例)
  - `backend/src/person/person.service.spec.ts`(7 个用例)
  - `backend/src/event/event.service.spec.ts`(11 个用例)
  - `backend/src/emperor/emperor.service.spec.ts`(12 个用例,findAll where 拼装 /
    嵌套 dynastyName / reign 范围 / dynasty 关联剥离 / JSON 字段解析 / findOne 命中
    与未命中 NotFoundException)
  - `backend/src/figure/common/figure-base.service.spec.ts`(9 个用例,JSON 解析白名单 9 字段、
    falsy 输入兜底、非法 JSON 不抛错)
  - `backend/src/religion/religion.service.spec.ts`(19 个用例,where 构建 tradition/nodeType/
    period(双落点)/relationship、默认 maxNodes=100 / maxEdges=200、orderBy、nodeIds 串联、
    includeNodeDetails 双分支、DTO 转换、totalNodes/totalEdges/tradition/nodeType 回显)
  - `backend/src/culture/culture.service.spec.ts`(21 个用例,findAllScholars 全字段 where
    /嵌套 schoolName / deathYear OR+null / orderBy / philosophicalSchool 剥离 / JSON 解析,
    findScholarById 命中与 NotFoundException,findAllSchools where / orderBy / JSON 解析,
    findSchoolById 命中与 NotFoundException,safeJsonParse 边界:空串 / 仅空白 / null /
    undefined / 已是对象不二次解析)
  - `backend/src/mythology/mythology.service.spec.ts`(14 个用例,findAll where
    category/origin/period/name + 双 orderBy 与分页,字段映射 name→title / origin→source /
    固定占位 englishTitle/imageUrl="" / description|origin null 兜底空串 /
    characters = stories.slice(0,5) / 非数组与非法 JSON 回落 [],findOne 命中映射与
    NotFoundException)
  - `backend/src/figure/tang/tang.service.spec.ts`(8 个用例,Tang 是 5 字段全集
    canonical 模板:role contains / period eq / name contains / birthYear gte /
    deathYear OR + null;`birthYear=0` 也进入 where(`!== undefined` 而非 truthy));
    Ming 与 Tang 形状完全一致,Song/Yuan/Qing 为 Tang 子集(无 period),共用
    transformFigure 已由 FigureBaseService spec 覆盖
  - `backend/src/figure/sanguo/sanguo.service.spec.ts`(6 个用例,Sanguo 与其它 5 朝代
    差异维度:`kingdom` 替代 `period`、`role/kingdom` 走 eq 而非 contains)
  - jest 配置追加 `moduleNameMapper`,把 Prisma 7 生成代码里的 ESM 风格 `.js` 导入回退到 `.ts`
- 前端核心组件 vitest 测试扩充(§2.8):19 个测试文件由"仅渲染不报错"扩到 146 个用例,覆盖
  关键交互、store 集成与 a11y(键盘事件、role/label)
  - `frontend/src/utils/storage.test.ts`(9 → 21,新增 clear / isSupported / 错误兜底 / sidebarStorage / dynastiesStorage / StorageListener)
  - `frontend/src/components/ui/{ErrorBoundary,LoadingSkeleton,ResponsiveTable,ResponsiveText,MobileTableContainer,ResponsiveContainer,ScrollContainer,ResponsiveButton,ResponsiveCard,YearSettingsPopover,ResponsiveLayout,PortraitSidebar}.test.tsx`
  - `frontend/src/components/common/{PersonCard,ContentCard,TabsContainer,CommonTabs,FixedTabsPage}.test.tsx`
  - `frontend/src/components/HoverScrollContainer/HoverScrollContainer.test.tsx`
- `frontend/src/store/createFigureStore.ts`:tang/song/yuan/ming 四个朝代人物 store 工厂(§2.1 起步),
  保留每个朝代的 hook 名与公开 API(无下游改动)
- `frontend/src/store/createFigureStore.test.ts`:工厂 6 个 vitest 用例(初始值 / 写入 /
  filter 透传 / 实例隔离)

### Changed
- `frontend/src/store/{tang,song,yuan,ming}FigureStore.ts`:四个 70+ 行的 store 各自重复实现
  `figures/selectedFigure/filters` 同一套逻辑,统一收敛到 `createFigureStore` 工厂(§2.1 起步),
  每个朝代 store 现在只剩 ~20 行,差异化的只有"角色枚举 / 时期常量 / service 实例 /
  默认排序"。Sanguo 因 filter 形状用 `kingdom` 与其它不同,本轮不并入,留待 §3.1 schema 重构。
- 后端 Service 层 16 处 `any` → `Prisma.XxxWhereInput`
- CI workflow 拆分前后端 job,后端加入 lint 与 type-check
- 6 个大组件按"主壳 + parts/ + hooks/"模式拆分:
  - `ReligionGraph` 669 → 223 行
  - `TimelineChart` 556 → 123 行
  - `QingRulerDetailModal` 547 → 132 行
  - `DynastyRow` 494 → 105 行
  - `SchoolDetail` 466 → 107 行
  - `Dynasty3DWheel` 414 → 76 行
- `EventService` 拆出 4 个私有方法(范围筛选 / where 合并 / 边界计算 / 行→DTO 映射),
  消除 findAll/getTimeline 重复逻辑(244 → 229 行)
- UI 库收敛到 MUI v9,移除 antd
- Vite 8 minify 改用 oxc 替代 esbuild
- 升级全部依赖至 MUI v9 / TS 6 / Vite 8 / React 19
- `ROADMAP.md` 重写,与当前现状对齐(M1~M7)
- `SECURITY.md` 修正虚假"已实现"项,补充本轮真实落地
- `README.md` 重写:前置要求 / 安装 / 项目结构 / 技术栈 与实际(Bun + SQLite)对齐
- `backend/Dockerfile` 运行时由 `node:20-slim` 切换至 `oven/bun:1.3-slim`(seed 入口需要 bun 运行时);启动命令变为 `prisma migrate deploy && (首次 prisma db seed) && bun dist/src/main.js`
- `backend/prisma.config.ts` 增加 `migrations.seed = 'bun ./prisma/seed.ts'`(Prisma 7 不再读 `package.json#prisma.seed`)
- `backend/.env.example` 默认值由 PostgreSQL DSN 改回 `file:./prisma/dev.db`,与实际 datasource 一致
- 根目录 `package.json` 的 `db:seed` / `db:migrate` / `db:reset` / `db:export` 改用 `bunx`
- `docker-compose.yml` 与 SQLite 栈对齐:移除遗留 `postgres` + `PostGIS` 服务,`backend` 改挂 named volume `backend_db:/app/prisma`,`DATABASE_URL` 指向 `file:/app/prisma/dev.db`,`frontend` 依赖 `backend` healthcheck 通过后启动

### Fixed
- `DataSourceIndicator` / `ApiStatusIndicator` 弹窗关闭时未清理 `testResults` / `testing` / `refreshing` 等本地状态,导致下次打开看到陈旧测试结果(§6.2)
- `layoutAlgorithms.ts` 第二个层级查找循环里 `placed = true; break;` 的 `placed` 赋值后不再被读取
  (`no-useless-assignment` 死存储),改为单纯 `break` 跳出

### Removed
- 废弃的 `frontend/src/services_backup/` 目录
- 历史遗留的 seed 脚本(已被新 `prisma/seed.ts` 取代):
  - `backend/prisma/comprehensive-seed.ts`
  - `backend/prisma/dynasty-seed.ts`
  - `backend/prisma/mock-import-seed.ts`
  - `backend/prisma/seeds.ts`
  - `backend/scripts/test-prisma.ts`
- `backend/{,prisma/}dev.db`:从 git 历史中解除追踪(`.gitignore` 已显式排除)

### Security
- ✅ 全局 `ValidationPipe` + `class-validator`(防 XSS)
- ✅ Prisma 参数化查询(防 SQL 注入)
- ✅ CORS 配置由 `CORS_ORIGIN` env 控制
- ⏳ HTTPS / 认证 / throttler / helmet / pino 待实现(详见 SECURITY.md)

---

## 历史版本

(暂无正式 release,所有变更目前都在 Unreleased)

---

## 版本说明

- **MAJOR**:不兼容的 API 变更
- **MINOR**:向后兼容的功能新增
- **PATCH**:向后兼容的 bug 修复

发布节奏建议:
- PATCH:随时发(只要有 bug 修复)
- MINOR:每月或重要功能就绪时
- MAJOR:重大架构调整时(如 Schema 重构、认证体系上线)
