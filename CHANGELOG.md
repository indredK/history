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
    Ming/Song 与 Tang 形状完全一致,Yuan 为 Tang 子集(无 period),共用
    transformFigure 已由 FigureBaseService spec 覆盖
  - `backend/src/figure/sanguo/sanguo.service.spec.ts`(6 个用例,Sanguo 与其它 5 朝代
    差异维度:`kingdom` 替代 `period`、`role/kingdom` 走 eq 而非 contains)
  - `backend/src/figure/qing/qing.service.spec.ts`(9 个用例,Qing 与其它朝代差异维度:
    orderBy 用 `[reignStart, name]` 而非 `[birthYear, name]`(因为 QingRuler 是帝王模型),
    没有 period 字段;`birthYear=0` 进入 where、deathYear OR(lte,null)、JSON 字段 transform)
  - jest 配置追加 `moduleNameMapper`,把 Prisma 7 生成代码里的 ESM 风格 `.js` 导入回退到 `.ts`
- 前端核心组件 vitest 测试扩充(§2.8):38 个测试文件 / 425 个用例,覆盖
  关键交互、store 集成、a11y(键盘事件、role/label)以及核心 utils:
  - `frontend/src/utils/services/errorHandling.test.ts`(22 个用例):ApiError 构造、
    SimpleFallbackManager.executeWithFallback 全路径(成功 / 失败计数 / 达阈值激活 /
    duration 过期自动停用 / CLIENT_ERROR 排除 / enableAutoFallback=false 短路),
    manualActivate/Deactivate/reset/updateConfig/getState 状态管理,retryOperation
    重试与终止
  - `frontend/src/utils/services/dataLoaders.test.ts`(33 个用例):getResourcePath /
    loadJsonData (ok=true/false + reject 透传) / loadJsonArray(数组直返 / 单对象包成
    [obj] / 失败兜底 []) / ResourceLoader 缓存(命中 / 未命中 / useCache=false bypass /
    clearCache by-key vs all / getCacheInfo) / DataLoadError 字段 / retryLoad(首次成功 /
    第二次成功 / 全失败包成 DataLoadError 保留 originalError / maxRetries=1 不等待) /
    createLoadingState 默认值 / handleApiResponse 列表多形态(success=true 数组 / 分页
    data.data / 单对象 → [obj] / success=false 抛 message / 原始数组 / 空兜底 []) /
    handleSingleApiResponse(success=true/false / 无 success 字段直通 / 空抛错) /
    createDataFetcher(默认 mock / mode='api' / mode='mock' / 参数透传)
  - `frontend/src/utils/storage.test.ts`(9 → 21,新增 clear / isSupported / 错误兜底 / sidebarStorage / dynastiesStorage / StorageListener)
  - `frontend/src/utils/performance.test.ts`(10 个用例):PerformanceMonitor 单例 /
    mark 写 metrics + 调 performance.mark API / measure 计算 duration + 调底层
    performance.mark/measure API / measure 兜底分支(mark 缺失返回 0 + console.warn)/
    `if (!startTime)` 把 start=0 也当作"未标记"的已知行为(锁定为回归测试)/
    getMetrics 快照 / reportWebVitals 两条分支
  - `frontend/src/utils/routeUtils.test.ts`(15 个用例):getRouteByPath
    (命中 / 未命中 / 空串 / 仅前缀 4 个分支)、getActiveTabFromPath 4 条具名分支 + 默认值 +
    大小写敏感、getAllRoutes 引用一致性 + 数据结构、validateRoutes 返回长度 +
    `routes.length + 1` 次 console.log + 每条 log 含 label/key/path
  - `frontend/src/utils/services/serviceFactory.test.ts`(11 个用例):
    createSimpleDataClient(mock 模式返回 mockService / api 模式返回 apiService)、
    createMultipleServices(configs 数组 → key→service 映射 / 空 configs)、
    ServiceMonitor 单例与 `serviceMonitor` 同引用 / registerService + getServiceList /
    未注册 recordCall 是 no-op / 成功累计 calls / 失败累计 errors + errorRate
    66.67% 四舍五入 / 零调用 errorRate '0%' / 多服务 stats 快照
  - `frontend/src/utils/services/apiClient.test.ts`(23 个用例):createApiClient
    默认 baseURL/timeout/Content-Type、自定义 baseURL、拦截器各 ≥1 条;响应拦截器
    rejected 分支全覆盖(无 response + code=ECONNABORTED → TIMEOUT、message 含 timeout、
    普通无 response → NETWORK、status≥500 → SERVER、4xx → CLIENT、response.data.message
    覆盖 error.message、已是 ApiError 直通);AUTH_REQUIRED_EVENT 在 401/403 触发并
    带 detail{status,url}、非 401/403 不触发;请求拦截器 rejected 也包成 ApiError;
    getApiStatus 拍平 fallbackManager.getState();fallbackControl 5 个方法薄包装;
    默认 `apiClient` 实例 baseURL 取自 DATA_SOURCE_CONFIG
  - `frontend/src/utils/apiTest.test.ts`(16 个用例):四个对外 fetch 包装器全覆盖。
    testApiConnection(success=true+data / 后端格式错误 / HTTP 非 2xx / fetch 抛错),
    testApiEndpoint(成功 / data.message 兜底 / message 缺失走默认 / HTTP 错 / fetch
    抛 Error / fetch 抛非 Error 值),testAllApiEndpoints(逐个调 5 个端点全成功 /
    任意一个失败时仍返回所有 results),testFrontendProxy(成功 + 代理 URL /
    格式错误 + details.suggestion 提示 Vite 代理 / HTTP 错 / fetch 抛错)
  - `frontend/src/store/religionStore.test.ts`(25 个用例):宗教关系图 store 全覆盖。
    初始 state(graphData=null / 高亮集合空 / viewMode='force')、基础 setters
    (setViewMode / setGraphData / setSelectedNode / 高亮集合 / 门派 / loading /
    error)、setHoveredNode(null 清三件、graphData=null 时只写入、命中节点把
    相连边 & 两端节点点亮含自己、孤立节点只点亮自己)、setSearchQuery(空 /
    仅空白 / graphData=null / 命中 name / 大小写归一化 / title 匹配命中)、
    getFilteredNodes(无数据 / 不筛 / selectedSects 命中含 sect 节点豁免 /
    searchQuery 跨 name/title/description / sect+search 同时生效)、
    getFilteredEdges 只留两端在 filteredNodes 中的边、
    getRelatedNodesAndEdges(graphData=null / 邻居含相连边 / 自身排除 / 孤立空)、
    resetFilters(只清 4 个筛选高亮字段,保留 hoveredNode/selectedNode/loading)
  - `frontend/src/store/themeStore.test.ts`(14 个用例):主题 store + 命名导出
    initializeTheme 全覆盖。setTheme(合法值落 localStorage + data-theme + state /
    非法值 console.warn 且 state 不变 / 二次切换)、toggleTheme(dark↔light 双向 +
    持久化 + DOM)、initializeTheme(store action:从 localStorage 恢复 / 没值或非法值
    回落 DEFAULT_THEME / matchMedia 桩验证 prefersReducedMotion=true/false)、
    localStorage 异常容错(happy-dom Storage 是 Proxy:set 拦截会对已有方法静默
    no-op,必须走 Object.defineProperty;getItem 抛错 console.warn + 回落 DEFAULT_THEME;
    setItem 抛错 console.warn 但不抛,state 仍写入)、命名导出 initializeTheme()
    (读 localStorage 写 DOM 但不动 store / 没值时写 DEFAULT_THEME 到 DOM)
  - `frontend/src/store/styleStore.test.ts`(12 个用例):样式 store + 命名导出
    initializeStyle 全覆盖。结构与 themeStore 同构(localStorage + data-style DOM
    副作用 + isValidStyle),复用 happy-dom Storage Proxy 绕过的
    Object.defineProperty 模式。setStyle 合法/非法值 + toggleStyle glass↔classic +
    initializeStyle 从存储恢复(无值或非法值回落 DEFAULT_STYLE)+ 异常容错
    (getItem 抛错 console.warn 回落 DEFAULT_STYLE / setItem 抛错 console.warn
    不抛、state 仍写入)+ 命名导出 initializeStyle 只动 DOM 不动 store
  - `frontend/src/store/mapStore.test.ts`(19 个用例):地图 store 全覆盖。
    初始 state(viewport 35/110/zoom=4、所有图层可见、selectedFeature=null)、
    setLocation(一次性 lat/lon/zoom + 不动 bearing/pitch)、setViewport 浅合并
    (单字段不丢其它 / 多字段一次更新)、setSelectedFeature/setHoveredFeature
    (写 Feature / null 清空)、setHoveredFeatureId(featureId+layerType 联动 admin/
    dynasty/null)、三个图层 toggle(admin/dynasty/eventMarkers 翻转)、
    setAdminBoundaryOpacity / setDynastyBoundaryOpacity 0-1 clamp
    (区间内直写 / 超 1 → 1 / 负数 → 0 / 边界 0|1 不变)
  - `frontend/src/store/dynastyExpandedStore.test.ts`(19 个用例):朝代展开
    store + 跨标签页同步全覆盖。isDynastyExpanded(默认 true 即 undefined ≠ false /
    显式 true/false)、setDynastyExpanded(写 state + 走 dynastiesStorage 持久化 /
    不覆盖已有 id)、toggleDynasty(默认 → false → 再 toggle → true / 走持久化)、
    expandAllDynasties/collapseAllDynasties(只动 dynastyIds 内的 id,其它字段保留 /
    写 localStorage)、getExpandedDynastiesCount(undefined+true 都计入,只有显式
    false 不计)、getTotalDynastiesCount、setDynastyIds(写入 / 清空)、
    跨标签页 StorageListener:dispatchEvent('storage') 命中 DYNASTIES_EXPANDED key
    时把新值灌进 store,无关 key 不影响 store
  - `frontend/src/store/scholarStore.test.ts`(12 个用例):学者 store 含
    in-house filter 全覆盖。setters + getFilteredScholars(两个 filter='全部' 直通 /
    dynasty 命中 scholar.dynasty / scholar.dynastyPeriod 兜底 / dynasty 与
    dynastyPeriod 同时存在时短路 OR 以 dynasty 为准 / schoolOfThought 命中 /
    AND 复合 / 字段缺失时 dynasty='全部' 通过,具体值不通过)
  - `frontend/src/store/mythologyStore.test.ts`(9 个用例):神话 store。
    setters(category=null 清空 / error 是 string)+ getFilteredMythologies
    (activeCategory=null 时短路返回原数组 + 不调 filterByCategory / 有 category
    时通过 vi.mock 的 filterByCategory 透传校验入参与返回)
  - `frontend/src/store/emperorStore.test.ts`(7 个用例):帝王 store。
    全 setters + getFilteredEmperors 把 store filters 转换后(注意 searchQuery
    → query)透传给 mocked emperorService.filterAndSort / getDynastyOptions
    ['全部', ...uniq(emperors.dynasty)] 保序去重 / emperors 为空时 ['全部']
  - `frontend/src/store/qingRulerStore.test.ts`(7 个用例):清朝统治者 store。
    全 setters + getFilteredRulers 透传(searchQuery→query)给 mocked
    qingRulerServiceHelper.filterAndSort / getPeriodOptions 与 QING_PERIODS 一致 /
    options 是纯配置静态(与 rulers 无关)
  - `frontend/src/store/sanguoFigureStore.test.ts`(12 个用例):三国人物 store。
    全 setters + getFilteredFigures 把 4 元 filters(role/kingdom/searchQuery/sortBy)
    转换后(注意 searchQuery→query)透传给 mocked sanguoFigureService.filterAndSort /
    getRoleOptions 静态 ['全部','ruler','strategist','general','official','other'] /
    getKingdomOptions 静态 ['全部','魏','蜀','吴','其他'] / options 与 figures 无关
  - `frontend/src/hooks/useSidebar.test.ts`(9 个用例):侧边栏 hook + 跨标签页同步全覆盖。
    renderHook+act 模式:localStorage 无值 → false / 已存 true → true / 已存 false →
    false(关键回归)、toggle 翻转、setCollapsed 直写、expand/collapse 幂等、useEffect
    挂载即落盘 + 变更同步 localStorage、跨标签页 dispatchEvent('storage'):key 匹配
    且 newValue !== 当前值 → 回填 / 同值不变 / 其它 key 忽略 / unmount 后再触发不抛
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
