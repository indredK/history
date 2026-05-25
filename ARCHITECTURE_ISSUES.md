# 架构剩余待办清单

> 项目:中国历史全视界 (Chinese Historical Panorama)
> 技术栈:NestJS + Prisma(SQLite) / React 18 + Vite / Bun workspace
> 状态:截至 2026-05-26
> 整体生产就绪度:**~75%**
>
> 本文档**只列剩余项**。已修复项见下方"已完成工作概览",或仓库 git log。

---

## 一、已完成工作概览

本轮 P0/P1 已落地的修复(commit 全部本地保留,未推送):

| Commit | 工作 |
|---|---|
| `1a3642b` | P0 §1.2 Service 层 16 处 any → Prisma WhereInput |
| `39cb74f` | P0 §4.1 CI 拆分前后端 job + lint + test |
| `8d8552a` | P0 §2.4 删除 services_backup/ |
| `7a95941` | P1 §2.2 5 朝代 FigureDetailModal 抽公共组件 |
| `178f9af` | P1 §2.5+§6.2+§6.4 HTTP 客户端错误分类 + 路由级 ErrorBoundary |
| `7e9ef10` | P1 §2.3 拆分 ReligionGraph(669→223 行) |
| `5b0212c` | P1 §2.3 拆分 TimelineChart(556→123 行) |
| `7539a88` | P1 §2.3 拆分 QingRulerDetailModal(547→132 行) |
| `8b17883` | P1 §2.3 拆分 DynastyRow(494→105 行) |
| `d3db134` | P1 §2.3 拆分 SchoolDetail(466→107 行) |
| `6dad68f` | P1 §2.3 拆分 Dynasty3DWheel(414→76 行) |
| `94eb489` | §1.5 Swagger 加 addBearerAuth + §4.3/§6.1 复核 |
| `a0074a5` | §2.6 UI 库收敛到 MUI v9(antd 已清除) |
| `0321f5b` | §4.4 ROADMAP / SECURITY 与现状对齐 |
| `8fe6336` | §4.4 M1 治理文档全套(CONTRIBUTING / CoC / CHANGELOG / Issue 模板 / dependabot) |
| `ec26deb` | §1.3 EventService 范围筛选与边界计算拆分(244→229 行) |
| `<本轮>` | §2.7 真正 404 页面 + §4.4 README 修正 + §6.3 e2e 冒烟测试 |
| `<本轮>` | §3.3 dev.db 剥离 → seed-data/*.json + `bun prisma/seed.ts`,补迁移对齐表结构 |
| 既有 | §2.7 路由懒加载 已用 `React.lazy` |

- **P0**:4 / 4 完成(§3.3 dev.db 剥离已落地,改用 seed-data JSON + `prisma db seed` 重建)
- **P1**:4 / 6 完成(状态合并推迟;pre-commit hooks 与 openapi-generator 受沙箱阻塞)

---

## 二、剩余待办

### 🔴 阻塞性问题

#### 1.1 完全缺失认证授权机制

- `grep -rn "UseGuards\|JwtAuthGuard" backend/src` 全部为空
- 所有 Controller 均为 public,无 JWT/Bearer Token 验证
- `SECURITY.md` 承诺的"用户身份认证"在代码中**零实现**
- 没有 `@Public()` / `@Roles()` 装饰器体系,后续接入认证将牵动所有路由
- **依赖**:Swagger bearer auth scheme 已在 `94eb489` 注册,Controller 加 `@ApiBearerAuth('JWT-auth')` 即可对接
- **工作量**:3~5 天

#### 1.6 单元测试覆盖率近似为 0

- 仅 1 个 spec:`app.controller.spec.ts`
- 所有业务 Service / Controller 均无测试
- `test/app.e2e-spec.ts` 已有冒烟测试(health + 404),业务路径未覆盖
- 估算覆盖率 **< 5%**
- **工作量**:持续投入,优先核心 Service
- **起步完成**:`DynastyService` / `PersonService` / `EventService` / `EmperorService` /
  `FigureBaseService` / `ReligionService` / `CultureService` / `MythologyService` /
  `TangService` / `SanguoService` 共 114 个 spec + 既有 `app.controller` spec = 116 个
  测试 ✅(jest 通过 `moduleNameMapper` 适配 Prisma 7 ESM 风格 `.js` 导入);Tang 作
  canonical 模板覆盖 Ming/Song/Yuan/Qing 的同形 where,Sanguo 单独覆盖 kingdom 维度

#### 2.1 状态管理失控:20 个独立 Store

`frontend/src/store/` 下共 20 个 Zustand store,每个 Figure store 都重复实现 `setSelectedFigure / filter / loading` 同一套逻辑。

- 没有 selector 模式,组件直接订阅整个 store,性能差
- store 之间无关联,跨实体联动需要在组件层手工拼接
- **建议**:按领域合并为 3~4 个 store(`historical-data` / `ui` / `navigation` / `theme`)
- **起步完成**:`createFigureStore` 工厂已抽出,tang/song/yuan/ming 四个 70+ 行 store 各自降到 ~20 行,
  对外 hook 名(`useTangFigureStore` 等)与所有 action / getter 不变,下游 `TangContent` /
  `SongContent` / `YuanContent` / `MingContent` 零改动。Sanguo 用 `kingdom` 而非 `period`,本轮不并入。
- **工作量**:1~2 天(单次会话不够,需要专项)

#### 3.1 Prisma Schema 设计不规范

**核心问题:朝代被建模成"表",而不是字段。**

- 通用模型:`Event / Person / Source / Place`
- 朝代专用模型:`TangFigure / SongFigure / YuanFigure / MingFigure / QingRuler / SanguoFigure`(6 张表结构几乎一致)
- **应改为**:单一 `HistoricalFigure` 表 + `dynastyId` 外键 + Discriminator 字段
- 改动会牵动后端 6 个模块和前端 6 套 store(关联 §1.4 / §3.2)
- **工作量**:2~3 天(含数据迁移)

#### 3.3 dev.db 被提交进仓库 ✅(本轮)

- 历史:[backend/prisma/dev.db](backend/prisma/dev.db) 曾被纳入版本控制(664 KB),`.gitignore` 中保留"用于部署初始数据"的妥协注释
- 风险:git 历史膨胀、二进制 merge 冲突、团队成员本地状态污染
- **方案落地**:
  - 新增 [backend/scripts/export-db.ts](backend/scripts/export-db.ts):一次性把 15 张表(共 732 行)导出到 `backend/prisma/seed-data/*.json`,JSON 字段已递归去转义
  - 新增 [backend/prisma/seed.ts](backend/prisma/seed.ts):按 FK 顺序读取 seed-data 并 `upsert`,幂等
  - 新增对齐迁移 `20260526024505_align_figure_columns_with_schema/migration.sql`:补齐 `tang/song/yuan/ming/qing/sanguo` 此前用 `db push` 直接打入数据库、未生成 migration 的 ~53 个列
  - `.gitignore` 显式排除 `backend/{prisma/,}dev.db{,.bak}`,`git rm --cached` 解除追踪
  - Prisma 7 走 [backend/prisma.config.ts](backend/prisma.config.ts) 的 `migrations.seed: 'bun ./prisma/seed.ts'`(7.x 不再读 `package.json#prisma.seed`)
  - [backend/Dockerfile](backend/Dockerfile) 运行时切到 `oven/bun:1.3-slim` + 启动钩子 `prisma migrate deploy && (首次跑 prisma db seed) && bun dist/src/main.js`
- **验证**:`rm dev.db && bunx prisma migrate deploy && bunx prisma db seed` 重建出 732 行,与原 dev.db 行数一致

---

### 🟠 重要问题

#### 1.3 EventService 已拆分 ✅(ec26deb)

已抽出 `buildOverlapRangeFilter` / `mergeWhere` / `calculateTimelineBounds` / `toTimelineEvent` 4 个私有方法,
findAll + getTimeline 的 70+ 行年份范围筛选条件去重。文件 244 → 229 行,圈复杂度显著下降。

#### 1.4 Figure 模块严重重复

`backend/src/figure/` 下为 Tang / Song / Yuan / Ming / Qing / Sanguo 各建独立模块:

- 6 套 Module + Controller + Service + DTO
- 字段高度雷同:`name / role / birthYear / deathYear / achievements / biography`
- 缺少 Base DTO / 抽象 Service / Mixin
- **根因**:同 §3.1,Prisma schema 为每个朝代建独立表
- **工作量**:与 §3.1 一并重构

#### 1.7 日志方案薄弱

- 只用 NestJS 内置 Logger,无结构化输出
- 无 winston / pino,无 request-id 追踪
- 生产排查问题困难
- **阻塞**:当前沙箱无法 npm install pino
- **工作量**:1 天

#### 2.7 路由层薄弱(剩余)

- ✅ 真正 404 兜底页面(本轮已实现 `pages/NotFoundPage.tsx`,替代之前的 Navigate 重定向)
- ❌ 路由守卫(待认证体系一起接入)

#### 2.8 前端测试形同虚设

- 已配置 vitest,有 19 个测试文件
- 但大部分仅含空 `describe` 块,无实际断言
- 组件交互测试缺失
- **工作量**:持续投入

#### 3.2 JSON 字段滥用

至少 5 处用 JSON 字段塞结构化数据:

- `Emperor.eraNames`(应该是 1:N 关系表)
- `TangFigure.works`(应建 `Work` 表)
- `Scholar.majorWorks` / `contributions`
- `QingRuler.policies`

**后果**:无法在 DB 层 join / 聚合 / 索引,所有计算都得拉到应用层做。

- **工作量**:与 §3.1 一并重构

#### 3.4 前后端类型契约缺失

- 没有共享的 `packages/types`
- Swagger 已生成 OpenAPI,但前端**未消费**(没有 openapi-generator / orval)
- 前端在 `services/*/types.ts` 手工维护类型,API 变更必然不同步
- **阻塞**:当前沙箱无法 npm install openapi-generator
- **工作量**:0.5 天

#### 4.1 CI 工作流(剩余)

- ✅ PR 检查工作流:新增 `.github/workflows/pr.yml`(Conventional Commits 标题校验 + lint informational + concurrency cancel-in-progress);`test.yml` 也加上 concurrency
- ❌ 代码覆盖率上报(待 codecov 集成)

#### 4.2 无 Git Hooks ⏸ 沙箱阻塞

- 没有 husky 配置
- 没有 commitlint(Conventional Commits 不强制)
- 没有 pre-commit lint/format
- **阻塞**:当前沙箱无法 npm install husky/lint-staged/commitlint
- **工作量**:1h

#### 4.4 文档缺失 / 与实现脱节

| 文档 | 状态 | 问题 |
|---|---|---|
| README.md | ✅ | 已修正为 Bun + SQLite,移除虚假目录引用(0321f5b/本轮) |
| SECURITY.md | ✅ | 已与现状对齐(0321f5b),未实现项明确列入"待实现" |
| DEPLOY.md | ✅ 存在 | 仅覆盖 GitHub Pages |
| ROADMAP.md | ✅ | 已重写为里程碑 M1~M7(0321f5b) |
| CONTRIBUTING.md | ✅ | 8fe6336 已新增 |
| CODE_OF_CONDUCT.md | ✅ | 8fe6336 已新增(Contributor Covenant 2.1) |
| CHANGELOG.md | ✅ | 8fe6336 已新增(Keep a Changelog) |
| ARCHITECTURE_ISSUES.md | ✅ | 本文档(0b153ac 已重写) |

> 文档基础设施基本就位,API 文档由 Swagger 自动生成(http://localhost:3001/api/docs)。

#### 4.5 monorepo 工具选型偏弱

- 使用 Bun workspace,简单但无构建缓存
- 没有 Turbo/Nx 的依赖图与增量构建
- CI 重复跑全部任务,浪费时间
- **工作量**:1 天

#### 6.2 / 6.3 剩余清理项

- ✅ §6.2 Modal 关闭时清理 state(本轮):
  - 5 朝代 FigureDetailModal + EmperorDetailModal + QingRulerDetailModal + ScholarDetailModal + SchoolDetail + MythologyDetailModal 全部为无内部 state 的纯展示组件,父级 `*Content.tsx` 已 `setSelected*(null)` 兜底
  - 有状态的 `DataSourceIndicator` / `ApiStatusIndicator` 抽出 `handleClose`,关闭时清理瞬态 `testResults` / `testing` / `refreshing`,避免下次打开看到陈旧结果
- §6.3 大量空的 vitest 测试文件(19 个文件大部分仅 `describe` 空块)
- ✅ §6.3 后端 `test/app.e2e-spec.ts` 已替换为带 health + 404 校验的冒烟测试(本轮)
- ✅ §3.3 仓库根 `docker-compose.yml` 已重写为 SQLite 栈(本轮),不再引用 PostgreSQL/PostGIS

#### 6.5 MapService 全部为硬编码 mock 数据

`backend/src/map/map.service.ts` 7 个公开方法全部返回硬编码字符串/数组,
完全没有走 Prisma:`getPlaces` 只返回 2 条北京/上海字面量、
`loadBoundaryData / getBoundaryDataByYear / loadBoundaryMappings / preloadCommonData` 全是 `'模拟边界数据'` 之类的字符串、
`clearCache / getCacheStats` 也只回包写死的 cacheItems=100 / cacheSize='10MB'。
对应的 Prisma 模型(`Place / BoundaryData`)其实是有的,但 service 根本没读。

不写单测,因为没有逻辑可测;但应当作为独立 issue 跟进,要么删掉(下架地图功能),要么真接 Prisma。

- **工作量**:接入 Prisma 1~2 天 / 删除半小时

---

## 三、安全(SECURITY.md 承诺 vs 实现)

| 承诺 | 实现 | 状态 |
|---|---|---|
| HTTPS/TLS 加密传输 | 无 HTTPS 配置 | ❌ |
| 输入验证与输出转义 | ValidationPipe + class-validator | ✅ |
| SQL 参数化查询 | Prisma 自带 | ✅ |
| CORS 配置限制 | 已配置 | ✅ |
| 环境变量管理 | `.env` 文件 | ✅ |
| 用户身份认证(OAuth/JWT) | **零实现** | ❌(同 §1.1) |
| 数据库连接加密 | 未配置 | ❌ |
| 速率限制与 DDoS 防护 | 无 `@nestjs/throttler` | ❌ |
| helmet 安全头 | 未配置 | ❌ |
| 安全审计日志 | 无 | ❌(同 §1.7) |

---

## 四、修复优先级建议

### 高优(下个阶段先做)

1. **§3.1 + §3.2 + §1.4 Schema 重构** — 一次性重构 Figure 表 / JSON 字段 / 后端模块 — 2~3 天
2. **§1.1 认证体系** — JWT + Guard 体系 + `@ApiBearerAuth('JWT-auth')` 接入 — 3~5 天
3. **§1.7 / §安全 后端安全补强** — `@nestjs/throttler` + helmet + pino 结构化日志 — 1 天

### 中优(可穿插)

4. **§2.1 状态管理合并** — 20 store → 4 store — 1~2 天
5. ~~**§4.4 文档补全** — CONTRIBUTING / CODE_OF_CONDUCT / README 修正 / API 文档~~ ✅ 已完成(0321f5b / 8fe6336 / 本轮)
6. ~~**§1.3 EventService 拆分**~~ ✅ 已完成(ec26deb)
7. **§2.7 / §1.1 路由守卫** — 跟着认证一起 — 0.5 天(§2.7 真 404 页 ✅ 本轮已完成)
8. **§1.6 / §2.8 单元测试持续投入** — 长期(本轮:前端 20 个 vitest 测试文件 174 个用例,
   覆盖关键交互、store 集成、createFigureStore 工厂和 errorHandling 全路径(降级 /
   重试 / 状态管理);后端 `DynastyService` / `PersonService` / `EventService` /
   `EmperorService` / `FigureBaseService` / `ReligionService` / `CultureService` /
   `MythologyService` / `TangService` / `SanguoService` 共 116 个用例)

### 低优(沙箱解开后再做)

9. **§3.4 openapi-generator** — 0.5 天 ⏸
10. **§4.2 pre-commit hooks** — 1h ⏸
11. **§4.5 Turbo/Nx 增量构建** — 1 天 ⏸

---

## 五、需要装包权限的项目

以下项当前会话受沙箱限制(npm registry 不可达)无法推进:

| 依赖 | 用途 | 关联 |
|---|---|---|
| pino + pino-pretty | 结构化日志 | §1.7 |
| @nestjs/throttler | 速率限制 | §安全 |
| helmet | 安全头中间件 | §安全 |
| husky + lint-staged + commitlint | pre-commit hooks | §4.2 |
| openapi-generator-cli 或 orval | 前后端类型同步 | §3.4 |
| turbo 或 nx | monorepo 增量构建 | §4.5 |
| @types/jest | 后端测试类型(目前用 bun test 但缺类型) | §1.6 |
