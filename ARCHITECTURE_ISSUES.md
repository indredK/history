# 项目架构问题盘点

> 项目:中国历史全视界 (Chinese Historical Panorama)
> 技术栈:NestJS + Prisma(SQLite) / React 18 + Vite / Bun workspace + Docker
> 盘点日期:2026-05-25
> 状态更新:2026-05-26 — P0 全部完成(3/4,dev.db 推迟);P1 完成 3/6(状态合并推迟、pre-commit hooks 与 openapi-generator 受沙箱阻塞)
> 总体评估:**架构完整,工程化补强至 75%+**

---

## 目录

- [一、后端架构问题](#一后端架构问题)
- [二、前端架构问题](#二前端架构问题)
- [三、数据库与数据流问题](#三数据库与数据流问题)
- [四、工程化与协作问题](#四工程化与协作问题)
- [五、安全问题(承诺 vs 实现)](#五安全问题承诺-vs-实现)
- [六、坏味道清单](#六坏味道清单)
- [七、优先级修复建议](#七优先级修复建议)

---

## 一、后端架构问题

### 1.1 完全缺失认证授权机制 🔴

- `grep -rn "UseGuards\|JwtAuthGuard" backend/src` 全部为空
- 所有 Controller 均为 public,无 JWT/Bearer Token 验证
- `SECURITY.md` 承诺的"用户身份认证"在代码中**零实现**
- 没有 `@Public()` / `@Roles()` 装饰器体系,后续接入认证将牵动所有路由

### 1.2 Service 层大量 `any` 类型,类型安全失守 ✅ 已修复(commit `1a3642b`)

至少 14 处 Service 中使用 `const where: any = {}` 构建查询条件,例如:

- [dynasty.service.ts:18](backend/src/dynasty/dynasty.service.ts:18)
- [event.service.ts:30](backend/src/event/event.service.ts:30) 、[event.service.ts:152](backend/src/event/event.service.ts:152)
- [culture.service.ts:29](backend/src/culture/culture.service.ts:29) 、[culture.service.ts:114](backend/src/culture/culture.service.ts:114)

**问题**:绕过了 Prisma 的类型推导,改名/删字段时 TS 不会报错,运行时才炸。

**建议**:用 `Prisma.XxxWhereInput` 替代,或抽取 `QueryBuilder`。

**修复**:`1a3642b refactor(backend): 替换 Service 层 16 处 any 类型为 Prisma WhereInput`

### 1.3 EventService 过度膨胀

- [event.service.ts](backend/src/event/event.service.ts) 共 243 行,是最大的 Service
- `findAll()` + `getTimeline()` 内嵌长达 70+ 行的年份范围筛选条件表达式
- 应抽出 `buildYearRangeFilter()` 等私有方法,降低圈复杂度

### 1.4 Figure 模块严重重复

`backend/src/figure/` 下为 Tang / Song / Yuan / Ming / Qing / Sanguo **每个朝代各建一个独立模块**:

- 6 套 Module + Controller + Service + DTO
- 字段高度雷同:`name / role / birthYear / deathYear / achievements / biography`
- 缺少 Base DTO / 抽象 Service / Mixin

**根因**:Prisma schema 也为每个朝代建了独立表(见 §3.1),前后端被迫复制。

### 1.5 Swagger 配置不完整

- [main.ts](backend/src/main.ts) 中 Swagger 已开,但缺少 Bearer/JWT 安全方案标签
- 接入认证后需要 `addBearerAuth()`,目前未预留

### 1.6 单元测试覆盖率近似为 0 🔴

- 仅有 1 个 spec:`app.controller.spec.ts`
- 所有业务 Service / Controller 均无测试
- `test/app.e2e-spec.ts` 为空白模板
- 估算覆盖率 **< 5%**

### 1.7 日志方案薄弱

- 只用 NestJS 内置 Logger,无结构化输出
- 无 winston / pino,无 request-id 追踪
- 生产排查问题困难

---

## 二、前端架构问题

### 2.1 状态管理失控:20 个独立 Store 🔴

[frontend/src/store/](frontend/src/store/) 下共 **20 个 Zustand store**:

```
dynastyStore / dynastyExpandedStore / emperorStore /
tangFigureStore / songFigureStore / yuanFigureStore /
mingFigureStore / qingRulerStore / sanguoFigureStore /
mythologyStore / religionStore / scholarStore / schoolStore /
personStore / timelineStore / mapStore / navigationStore /
styleStore / themeStore / index.ts
```

**问题**:

- 每个 Figure store 都重复实现 `setSelectedFigure / filter / loading` 同一套逻辑
- 没有 selector 模式,组件直接订阅整个 store,性能差
- store 之间无关联,跨实体联动需要在组件层手工拼接

**建议**:按领域合并为 3~4 个 store(historical-data / ui / navigation / theme)。

### 2.2 重复的 DetailModal 组件 ✅ 已修复(commit `7a95941`)

7 个朝代/类型的 Modal 高度相似:

| 文件 | 行数 |
|---|---|
| [QingRulerDetailModal.tsx](frontend/src/features/people/components/qing/QingRulerDetailModal.tsx) | **547** |
| [ScholarDetailModal.tsx](frontend/src/features/culture/components/ScholarDetailModal.tsx) | 406 |
| [MythologyDetailModal.tsx](frontend/src/features/mythology/components/MythologyDetailModal.tsx) | 206 |
| SanguoFigureDetailModal | 171 |
| TangFigureDetailModal / SongFigureDetailModal / YuanFigureDetailModal / MingFigureDetailModal | 各 170 |
| EmperorDetailModal | 161 |

**建议**:抽出 `<BaseFigureDetailModal data={...} schema={...}>`,以 schema 驱动字段渲染。

**修复**:`7a95941 refactor(frontend): 5 朝代 FigureDetailModal 抽公共组件 (P1-5)` —— 抽出 `BaseFigureDetailModal`,Tang/Song/Yuan/Ming/Sanguo 收敛为薄壳;Qing 因数据结构差异另行拆分(见 §2.3)。

### 2.3 大文件清单 ✅ 已修复(6/6,P1-9 共 6 个 commit)

| 文件 | 原行数 | 拆分后主壳 | 修复 commit |
|---|---|---|---|
| ReligionGraph.tsx | **669** | 223 | `7e9ef10` |
| TimelineChart.tsx | 556 | 123 | `5b0212c` |
| QingRulerDetailModal.tsx | 547 | 132 | `7539a88` |
| DynastyRow.tsx | 494 | 105 | `8b17883` |
| SchoolDetail.tsx | 466 | 107 | `d3db134` |
| Dynasty3DWheel.tsx | 414 | 76 | `6dad68f` |

每个大组件按"主壳 + parts/ 子模块 / hooks/ + utils/"模式拆分,子模块单文件 < 260 行。

### 2.4 废弃目录未清理 ✅ 已修复(commit `8d8552a`)

- `frontend/src/services_backup/` 存在完整副本(README / apiService / base / culture / dataClient ...)
- 既不在 import 链上,也未在 git 中删除
- 风险:容易误改备份版本,占用搜索结果干扰开发

**立即可删**。

**修复**:`8d8552a chore: 删除废弃的 services_backup 目录`

### 2.5 API 服务层包装过深 ✅ 已修复(commit `178f9af`)

调用链:`Component → apiService.ts → base/serviceFactory.ts → utils/services/serviceFactory.ts → fetch`

- 三层转接,排查问题难
- **没有统一的 HTTP 客户端**(无 axios 实例,无全局拦截器)
- 401/403/timeout/重试 无处兜底
- Mock/真实切换通过 `frontend/src/config/dataSource.ts` 的 `DATA_SOURCE_MODE: 0 | 1` 硬编码

**修复**:`178f9af refactor(frontend): HTTP 客户端错误分类 + 路由级错误边界 (P1-7)`
- `apiClient.ts` 全量重写,axios 拦截器统一处理 timeout / network / 5xx / client error
- 401/403 通过 `AUTH_REQUIRED_EVENT` 自定义事件解耦
- `serviceFactory.ts` 加 `withTransientRetry` 包装(network/timeout/5xx 自动重试 2 次)

### 2.6 UI 库混用 ✅ 已修复(commit `a0074a5` 等)

- ~~同时使用 **Ant Design + Material-UI**~~
- ~~包体积明显膨胀,主题系统冲突,组件视觉风格不统一~~
- ~~应择一收敛~~

**当前状态**:已收敛到 Material-UI(MUI v9),`grep -rn "from 'antd'" frontend/src/` 已无输出,package.json 中不再依赖 antd。

### 2.7 路由层薄弱 ✅ 大部分已修复(commit `178f9af` + 既有 `routes.ts`)

- ~~无 `React.lazy` 懒加载,首屏加载所有页面~~ —— `routes.ts` 各页面均已使用 `lazy(() => import(...))`
- 无 404 兜底页面 —— 当前用 `<Route path="*" element={<Navigate to="/timeline" replace />} />` 兜底重定向(可后续补真正 404 页)
- 无路由守卫(认证接入后必需) —— 待 P2 认证体系一起接入

### 2.8 前端测试形同虚设

- 已配置 vitest,有 19 个测试文件
- 但**大部分仅含空 `describe` 块**,无实际断言
- 组件交互测试缺失

---

## 三、数据库与数据流问题

### 3.1 Prisma Schema 设计不规范 🔴

**核心问题:朝代被建模成"表",而不是字段。**

- 通用模型:`Event / Person / Source / Place`
- **朝代专用模型**:`TangFigure / SongFigure / YuanFigure / MingFigure / QingRuler / SanguoFigure`(6 张表结构几乎一致)

**应改为**:单一 `HistoricalFigure` 表 + `dynastyId` 外键 + Discriminator 字段。

### 3.2 JSON 字段滥用

至少 5 处用 JSON 字段塞结构化数据:

- `Emperor.eraNames`(应该是 1:N 关系表)
- `TangFigure.works`(应建 `Work` 表)
- `Scholar.majorWorks` / `contributions`
- `QingRuler.policies`

**后果**:无法在 DB 层 join / 聚合 / 索引,所有计算都得拉到应用层做。

### 3.3 dev.db 被提交进仓库 🔴 ⏸ 已决定推迟

- [backend/prisma/dev.db](backend/prisma/dev.db) 大小 **664 KB**
- `.gitignore` 中有注释说明"保留用于部署初始数据"
- 风险:
  - 每次数据变更都产生大 diff,git 历史膨胀
  - 二进制冲突难以合并
  - 团队成员的本地状态会污染共享 db

**建议**:
1. 把数据初始化逻辑写进 `prisma/seed.ts`
2. 将 `dev.db` 加入 `.gitignore`
3. CI 部署时执行 `prisma migrate deploy && prisma db seed`

### 3.4 前后端类型契约缺失 🟠

- 没有共享的 `packages/types`
- Swagger 已生成 OpenAPI,但前端**未消费**(没有 openapi-generator / orval 跑类型)
- 前端在 `services/*/types.ts` 手工维护类型,API 变更必然不同步

---

## 四、工程化与协作问题

### 4.1 CI 工作流不完整 ✅ 部分已修复(commit `39cb74f`)

`.github/workflows/` 共 3 个文件:

- ~~`test.yml`:只跑**前端** `bun run test` + type-check,**后端测试被完全忽略**~~ —— 已拆分前后端 job
- `deploy-full.yml` / `deploy-gh-pages.yml`:部署管线

修复后状态:

- ✅ Lint 检查 CI 步骤(前端/后端均加入)
- ✅ 后端测试(单独 job 跑 `bun test` + `bun run type-check`)
- ❌ PR 检查工作流(可选,GitHub Actions 默认对 PR 自动跑 test.yml)
- ❌ 代码覆盖率上报(待 codecov 集成)

**修复**:`39cb74f ci: 拆分前后端 job,后端加入 test 与 type-check`

### 4.2 无 Git Hooks

- 没有 husky 配置
- 没有 commitlint(Conventional Commits 不强制)
- 没有 pre-commit lint/format

任何不规范代码都能提交。

### 4.3 根目录脚本 bug

[package.json](package.json) 中 `lint:fix:backend` 实际跑的是 `lint` 而非 `lint:fix`(待复核)。

### 4.4 文档与实现脱节

| 文档 | 状态 | 问题 |
|---|---|---|
| README.md | ✅ | 示例用 PostgreSQL,实际用 SQLite |
| SECURITY.md | ✅ | 承诺的认证/HTTPS/速率限制全未实现 |
| ROADMAP.md | ✅ | 信息有限 |
| DEPLOY.md | ✅ | 仅覆盖 GitHub Pages |
| CONTRIBUTING.md | ❌ | **缺失** |
| CODE_OF_CONDUCT.md | ❌ | **缺失** |

### 4.5 monorepo 工具选型偏弱

- 使用 Bun workspace,简单但无构建缓存
- 没有 Turbo/Nx 的依赖图与增量构建
- CI 重复跑全部任务,浪费时间

---

## 五、安全问题(承诺 vs 实现)

[SECURITY.md](SECURITY.md) 与代码现实的差距:

| 承诺 | 实现 | 状态 |
|---|---|---|
| HTTPS/TLS 加密传输 | 无 HTTPS 配置 | ❌ |
| 输入验证与输出转义 | ValidationPipe + class-validator | ✅ |
| SQL 参数化查询 | Prisma 自带 | ✅ |
| CORS 配置限制 | 已配置 | ✅ |
| 环境变量管理 | `.env` 文件 | ✅ |
| 用户身份认证(OAuth/JWT) | **零实现** | ❌ |
| 数据库连接加密 | 未配置 | ❌ |
| 速率限制与 DDoS 防护 | 无 `@nestjs/throttler` | ❌ |
| 安全审计日志 | 无 | ❌ |

---

## 六、坏味道清单

### 6.1 硬编码值

| 位置 | 值 | 处理 |
|---|---|---|
| [backend/src/main.ts:33](backend/src/main.ts:33) | `'http://localhost:5173'` | 走 ENV |
| [frontend/src/config/dataSource.ts](frontend/src/config/dataSource.ts) | `'http://localhost:3001/api/v1'` | 走 `VITE_API_BASE_URL` |
| `dataSource.ts` 中 `DATA_SOURCE_MODE` | `0 \| 1 = 1`,硬编码 | 走 ENV |
| `vite.config.ts` proxy | `'http://localhost:3001'` | 用 ENV |

### 6.2 缺失的错误处理 ✅ 大部分已修复(commit `178f9af`)

- ~~部分 API 调用无 try/catch~~ —— axios 拦截器全局兜底
- ~~网络超时无重试~~ —— `withTransientRetry` 包装 network/timeout/5xx 自动重试 2 次
- ~~5xx 无统一的用户提示~~ —— `ApiError` 错误分类(`network` / `timeout` / `server` / `client` / `auth`),组件层可按 `kind` 渲染
- Modal 关闭时未清理数据(仍待逐个 Modal 收敛)

### 6.3 待清理项

- `frontend/src/services_backup/`(整个目录)
- 大量空的 vitest 测试文件
- 后端 `test/app.e2e-spec.ts` 空模板

### 6.4 缺失的边界 ✅ 前端部分已修复(commit `178f9af`)

- 后端无速率限制(`@nestjs/throttler`) —— 待 P2 一并接入
- 后端无 helmet 安全头 —— 待 P2 一并接入
- 后端无连接池配置说明 —— 待 P2
- ~~前端无 ErrorBoundary 覆盖路由层(只有局部)~~ —— `Router.tsx` 已在每条路由外层包裹 `<ErrorBoundary>`,且 `apiClient` 的 401/403 通过事件解耦给路由层兜底

---

## 七、优先级修复建议

### 🔴 P0 — 阻塞性问题(本周必修)

1. ✅ **CI 加入后端测试 + lint** — commit `39cb74f`
   - 工作量:2~4h
   - 改 `.github/workflows/test.yml`,加 `cd backend && bun test`、`bun lint`

2. ✅ **修复 Service 层 `any` 类型**(14 处) — commit `1a3642b`
   - 工作量:3h
   - 用 `Prisma.XxxWhereInput` 替换 `const where: any`

3. ⏸ **从仓库剥离 dev.db** — 已决定推迟
   - 工作量:1~2h
   - 加 `.gitignore`,数据写到 `prisma/seed.ts`,CI 部署时 seed

4. ✅ **删除 `services_backup/`** — commit `8d8552a`
   - 工作量:5 分钟
   - 防止误改

### 🟠 P1 — 重要问题(本月修)

5. ✅ **DetailModal 抽公共组件** — commit `7a95941`
   - 抽 `<BaseFigureDetailModal>`,schema 驱动
   - 工作量:0.5~1 天

6. ⏸ **状态管理合并** — 推迟(单次会话工作量过大,需要专项)
   - 20 个 store 合并为 4 个
   - 工作量:1~2 天

7. ✅ **统一 HTTP 客户端 + 拦截器** — commit `178f9af`
   - 抽 `services/http.ts`,401/超时/重试统一处理
   - 工作量:0.5 天

8. ⏸ **添加 pre-commit hooks** — 阻塞(沙箱无法 npm install husky/lint-staged/commitlint)
   - husky + lint-staged + commitlint
   - 工作量:1h

9. ✅ **大组件拆分** — 6 个 commit:`7e9ef10` `5b0212c` `7539a88` `8b17883` `d3db134` `6dad68f`
   - ReligionGraph / TimelineChart / QingRulerDetailModal / DynastyRow / SchoolDetail / Dynasty3DWheel 全部完成
   - 工作量:2~3 天(实际)

10. ⏸ **前后端类型同步** — 阻塞(沙箱无法 npm install openapi-generator)
    - 用 openapi-generator 从 Swagger 生成前端类型
    - 工作量:0.5 天

### 🟡 P2 — 优化项(下季度)

11. **Schema 重构**:Figure 表合并为 `HistoricalFigure` + `dynastyId`,JSON 字段拆为关系表
    - 工作量:2~3 天(含迁移)

12. **认证体系**:JWT 或 OAuth2,加 Guard 体系
    - 工作量:3~5 天

13. **UI 库收敛**:在 Ant Design / MUI 中二选一
    - 工作量:1~2 天

14. **补全文档**:CONTRIBUTING / CODE_OF_CONDUCT / API 详细文档
    - 工作量:1~2 天

15. **路由懒加载 + 404 + 路由守卫**
    - 工作量:0.5 天

16. **后端速率限制 + helmet + 结构化日志**(pino + request-id)
    - 工作量:1 天

---

## 总评

| 维度 | 评分 | 备注 |
|---|---|---|
| 架构完整度 | 7 / 10 | 模块划分清晰,但 Figure 层冗余(待 P2 schema 重构) |
| 工程化 | 6 / 10 | CI 已补全前后端 lint/test;hooks 仍待补 |
| 代码质量 | 7 / 10 | Service 层 any 已清零;6 个大组件拆分完成 |
| 安全性 | 3 / 10 | 文档承诺与实现差距过大(认证/HTTPS/速率限制仍未实现) |
| 可维护性 | 7 / 10 | DetailModal/大组件已抽公共;HTTP 拦截器统一;状态管理待 P2 合并 |
| **总体生产就绪度** | **~75%** | P0 + P1 主项已落地;上生产仍需补认证、速率限制、helmet |
