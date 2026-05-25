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
    deathYear OR + null;`birthYear=0` 也进入 where(`!== undefined` 而非 truthy))
  - `backend/src/figure/ming/ming.service.spec.ts`(8 个用例,与 Tang 同形 5 字段,
    role contains 用明朝典型值 `cabinet`,period 用 "中后期",JSON 字段示例覆盖
    `policies` 路径(张居正考成法))
  - `backend/src/figure/song/song.service.spec.ts`(8 个用例,与 Tang 同形 5 字段,
    role contains 用宋特征值 `chancellor`,period 用 "北宋",JSON 字段示例覆盖
    `works + policies` 双路径(王安石熙宁变法))
  - `backend/src/figure/yuan/yuan.service.spec.ts`(9 个用例,Yuan 是 Tang 的子集 —
    yuan.service.ts:13 的 destructure **不含 period**,显式锁定 "传入 period 静默丢弃"
    的当前行为,避免日后误以为 period 应该生效;role contains 用元朝典型值 `khan`,
    JSON 字段示例覆盖 `battles` 路径(忽必烈襄阳之战))
  - `backend/src/figure/sanguo/sanguo.service.spec.ts`(6 个用例,Sanguo 与其它 5 朝代
    差异维度:`kingdom` 替代 `period`、`role/kingdom` 走 eq 而非 contains)
  - `backend/src/figure/qing/qing.service.spec.ts`(9 个用例,Qing 与其它朝代差异维度:
    orderBy 用 `[reignStart, name]` 而非 `[birthYear, name]`(因为 QingRuler 是帝王模型),
    没有 period 字段;`birthYear=0` 进入 where、deathYear OR(lte,null)、JSON 字段 transform)
  - jest 配置追加 `moduleNameMapper`,把 Prisma 7 生成代码里的 ESM 风格 `.js` 导入回退到 `.ts`
- 前端核心组件 vitest 测试扩充(§2.8):94 个测试文件 / 861 个用例,覆盖
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
  - `frontend/src/hooks/useDynastiesExpanded.test.ts`(26 个用例):朝代展开 hook 全覆盖。
    初始化(localStorage 无值/有值)、isDynastyExpanded(undefined/true/false 默认展开规则)、
    setDynastyExpanded(写入 + useEffect 持久化 + 追加不影响已有)、toggleDynasty(双向)、
    expandAll/collapseAll(传 ids,只动 ids)、toggleAll(全展开则收起,否则全展)、
    areAllExpanded/areAllCollapsed(默认展开规则)、expandAllDynasties/collapseAllDynasties
    (无参版:已有 ids 优先,空 state 走 default 24 朝代列表)、getExpandedDynastiesCount
    (固定 default 24 + undefined/true 计入,显式 false 不计 + 不在 default 24 列表的
    id 不影响)、getTotalDynastiesCount 固定 24、跨标签页 storage 事件回填整个 expandedStates
  - `frontend/src/store/personStore.test.ts`(3 个用例):通用人物 store。persons/
    selectedPersonId/searchQuery 三组 setter + null/空串清空语义
  - `frontend/src/store/navigationStore.test.ts`(3 个用例):导航 store。
    默认 activeTab='timeline' 锁定 + setActiveTab 任意字符串 + 空串不校验
  - `frontend/src/store/timelineStore.test.ts`(4 个用例):时间轴 store。
    默认 -500~2000 + setYears 一次性更新两端 + 允许负数(BC)+ 不校验先后顺序
  - `frontend/src/store/dynastyStore.test.ts`(3 个用例):朝代 store。
    setDynasties 同引用 + setSelectedDynasty 写入/null 清空
  - `frontend/src/store/schoolStore.test.ts`(3 个用例):学派 store。
    全 setter + null 清空 + loading 反复切换
  - `frontend/src/store/{tang,song,yuan,ming}FigureStore.test.ts`(各 4 个用例,合 16 个):
    四朝人物 store 工厂实例化烟雾测试。各自验证 sortBy='birthYear' 默认值、
    roleOptions(tang 用 poet / song+yuan 用 scholar / ming 用 cabinet+eunuch 替代)、
    periodOptions 与 {TANG,SONG,YUAN,MING}\_PERIODS 配置一致、
    getFilteredFigures 走对应 service(tangFigureService / songFigureServiceHelper /
    yuanFigureServiceHelper / mingService)且 searchQuery→query 重命名
  - `frontend/src/hooks/useDynastyImage.test.ts`(6 个用例):朝代代表图懒加载 hook。
    桩 `globalThis.Image` 类记录实例 + 触发 onload/onerror、imageCache 命中复用同一 URL
    不再发起新 Image、selectedDynasty=null 重置 state 不抛错、不同 id 切换重新加载、
    错误分支同时清空 imageUrl 与置 error / isLoading=false
  - `frontend/src/hooks/useDynastyBackground.test.ts`(8 个用例):背景图布局 hook +
    useHasSelectedDynasty。`vi.mock('./useDynastyImage')` 返回可变 mock,验证:有
    selectedDynasty+imageUrl 时 backgroundStyle 写入 url() + scroll(移动)/fixed
    (桌面)、无图时 fallback 仅 transparent、`hasBackgroundImage` 三态(true/false/loading
    时仍可能 true)、useHasSelectedDynasty 反映 selectedDynasty 真值
  - `frontend/src/hooks/useResponsive.test.ts`(16 个用例):响应式工具 hook 全家桶。
    `vi.useFakeTimers + advanceTimersByTime(150)` 测 debounce、`vi.stubGlobal('matchMedia')`
    - `Object.defineProperty(navigator,'maxTouchPoints')` 完成断点覆盖。
      useResponsive(mobile/tablet/desktop 三档断点 + isPortrait/isLandscape + width/height
      随 resize 更新 + debounce)、useMediaQuery(初始命中 / 不命中 / change 事件切换)、
      useTouchDevice(maxTouchPoints>0 / ontouchstart in window / 都没有则 false)、
      useOrientation(读 screen.orientation.type / 兜底 window.innerWidth>height 横屏判定)、
      useViewport(width/height 实时 + debounce)
  - `frontend/src/hooks/useStyleAwareGlass.test.ts`(12 个用例):样式感知 glass hook 三件套。
    `vi.mock('./useResponsive')` 注入固定 screenWidth=1280,验证 useStyleAwareGlass classic
    分支(不返回 backdropFilter)与 glass 分支(rgba + backdropFilter)、暗色/亮色主题切换、
    `intensity`/`opacity`/`customColor` 自定义选项覆盖、useIsClassicStyle(style==='classic'
    严格等)、useCurrentStyle(透传 useStyleStore.style)
  - `frontend/src/hooks/useGlassStyle.test.ts`(15 个用例):基础 glass style hook 三件套。
    同时 mock `./useResponsive` 与 `../config/styles`,通过可变 stylesState 切换
    supportsBlur/reducedMotion/isLowEnd/shouldBlur/performanceClasses。useGlassStyle
    (默认 / 自定义 opacity+blur+borderOpacity+saturation / dark 主题 / shouldBlur=false
    回落 fallback 透明背景 / 浮点精度:0.7+0.1=0.7999... 用 toBeCloseTo(0.8, 5) + 正则匹配)、
    useComponentGlassStyle(card/modal/sidebar/floating/tooltip 五个预设各自的
    opacity/blur 数值锁定)、useGlassPerformance(supportsBlur=false → fallback +
    isLowEnd=true → reduced + reducedMotion=true → no-transition)
  - `frontend/src/hooks/useDataFetch.test.ts`(11 个用例):异步数据 hook + 模块级缓存。
    每个用例用唯一 cacheKey 避免污染。成功路径(loading→data + cache 写入)、
    失败路径(error 字符串 + data=null)、cache 命中(skipFetcher → 同步返回不调 fetcher)、
    clearCache(by-key / all)、refetch(强制重新 fetch 即使有缓存)、
    retryCount=2(共 3 次 fetcher 调用)、cancel(unmount 后 setState 静默不抛)
  - `frontend/src/hooks/useFunctionPanelScroll.test.ts`(10 个用例):功能面板滚动 hook。
    桩 requestAnimationFrame 收集回调手动 flush、桩 ResizeObserver。
    scroll 事件(scrollTop 直读 + gradientMaskTop/Bottom 透明度按位置插值)、
    scrollTo(写 scrollTop + 触发一次同步 scroll)、gradient 边界(顶部 opacity=0 /
    底部 opacity=0)、unmount cleanup(removeEventListener + ResizeObserver.disconnect)
  - `frontend/src/hooks/useHoverScroll/utils.test.ts`(17 个用例):纯函数模块全覆盖。
    calculateScrollStep((target-current)\*easing + easing 被 clamp 到 [0.001, 1])、
    isScrollComplete(默认 threshold=0.5 + 自定义)、calculateTargetFromMousePosition
    (mouseX 落容器中点→maxScroll/2 + 越界 ratio clamp 至 0/1 + containerWidth<=0
    或 maxScroll<=0 直接返回 0)、isPointInScrollbarArea(底部 16px 区域内 +
    边界包含 + 左右越界 false)、getScrollbarAreaBounds(返回 4 边界)、
    serialize/deserialize round-trip + 缺字段/类型错误抛 "Invalid scroll state format"
  - `frontend/src/hooks/useHoverScroll/useScrollState.test.ts`(5 个用例):
    滚动状态计算 hook。桩 ResizeObserver/MutationObserver。scrollWidth > clientWidth
    → hasScrollableContentRef.current=true,反之 false、getScrollState 返回容器
    scrollLeft/maxScroll/hasScrollable 快照、ref=null 时全零兜底、
    maxScroll 用 `Math.max(0, ...)` clamp 负值
  - `frontend/src/hooks/useHoverScroll/useSmoothAnimation.test.ts`(7 个用例):
    平滑滚动 rAF 动画 hook。桩 rAF 收集回调 + cancelSpy 验证卸载。setTarget(写入 +
    负值 clamp 至 0)、rAF 循环(enabled+hasScrollable+未达 target → scrollLeft 按
    `easing=0.5` 收敛 0→50→75 + 触发 onFrame(current, target))、enabled=false
    (不动 scrollLeft 但下一帧仍续)、hasScrollable=false(targetScroll 同步回当前
    scrollLeft 不动 onFrame)、已到 target(差值<threshold)→ 不动、syncWithCurrent
    (target+lastScrollLeftRef 一起回归当前 scrollLeft)、unmount 调 cancelAnimationFrame
  - `frontend/src/hooks/useHoverScroll/useScrollbarAreaDetect.test.ts`(9 个用例):
    scrollbar 命中检测 + 事件拦截 hook。getBoundingClientRect 桩固定矩形。
    mousemove 在底部 16px 区域内 + 可滚动 → onPositionChange(target, ratio)
    且 inAreaRef.current=true、区域外 → ref=false 且不调回调、enabled=false 完全跳过、
    不可滚动(maxScroll<=0)→ ref 强制 false、mouseleave 重置 ref、wheel/mousedown/
    touchstart ref=true 时 preventDefault,ref=false 时不动、document keydown
    scroll 相关 key(ArrowLeft 等)+ ref=true 时 preventDefault,普通 key 不动、
    unmount 后再触发不调回调(listener 全移)
  - `frontend/src/hooks/useHoverScroll/useHoverScroll.test.ts`(5 个用例):主入口
    composite hook 集成。验证 3 个子 hook 编排:getScrollState 透传 useScrollState
    输出、setScrollPosition 仅写内部 ref 不直接动 scrollLeft(rAF 被桩成 no-op)+
    setEnabled 可来回切换、container scroll 事件非 scrollbar 区域时同步
    targetScroll=scrollLeft(getScrollState.scrollLeft 反映)、ref=null 时
    setEnabled/setScrollPosition 不抛错 + getScrollState 全零兜底、setEnabled
    false/true 切换不影响 getScrollState
  - `frontend/src/services/person/tang/tangService.test.ts`(30 个用例):tang 是
    人物 helper canonical 模板。验证 filterByRole/filterByPeriod/filterByFaction
    `全部`/空串直通 + 命中,searchFigures 覆盖 name+courtesy+positions+faction,
    sortFigures `birthYear` 升序、`role` 按 roleOrder
    `emperor(1)>chancellor(2)>general(3)>official(4)>poet(5)>other(6)` 升序 +
    同 role 时 birthYear 升序、`name` zh-CN locale,filterAndSort 串联与全
    undefined 直通,getRoleLabel 6 档 + 未知兜底 `其他`,formatLifespan /
    calculateAge,默认 getAll/getById stub
  - `frontend/src/services/person/sanguo/sanguoService.test.ts`(19 个用例):
    sanguo 用 kingdom(魏/蜀/吴/其他)替代 period/faction,sortBy 多 `kingdom` 档:
    `魏(1)>蜀(2)>吴(3)>其他(4)`,roleOrder 重新洗牌
    `ruler(1)>strategist(2)>general(3)>official(4)>other(5)`,search 覆盖
    name+courtesy+positions(无 faction)
  - `frontend/src/services/person/song/songService.test.ts`(9 个用例):
    song 与 tang 同构,roleOrder
    `emperor(1)>chancellor(2)>general(3)>official(4)>scholar(5)>other(6)`,
    period 为 `北宋前期/北宋后期/南宋前期/南宋后期`
  - `frontend/src/services/person/yuan/yuanService.test.ts`(9 个用例):
    yuan 与 song 同 roleOrder,period 为 `元初/元中期/元末`,
    roleLabel 差异:emperor=`皇帝/大汗`,chancellor=`丞相`
  - `frontend/src/services/person/ming/mingService.test.ts`(9 个用例):
    ming roleOrder 把 chancellor 换成 cabinet、poet/scholar 换成 eunuch:
    `emperor(1)>cabinet(2)>general(3)>official(4)>eunuch(5)>other(6)`,
    period 为 `明初/明中期/明末`,roleLabel:cabinet=`内阁大臣`,eunuch=`宦官`
  - `frontend/src/services/person/qing/qingRulerService.test.ts`(13 个用例):
    清朝统治者(帝王模型)用 reignStart/reignEnd 替代 birthYear/deathYear,
    sortBy 只有 `reignStart/name` 两档,search 覆盖 name+templeName+eraName,
    period 走 `清初/盛清/清中期/晚清` 4 段,getTitle:
    templeName=`（无庙号）` → `${eraName}帝`,否则 `清${templeName}（${eraName}）`,
    formatReignPeriod / calculateReignYears 与默认 getAll/getById stub
  - `frontend/src/services/person/emperors/emperorService.test.ts`(20 个用例):
    emperor 用 DYNASTY_ORDER map(西汉=7 < 唐=15 < 北宋=17,未知 → 999 排到最后)
    排序,formatReignPeriod 支持负数年份(`reignStart<0` → `公元前N年`、
    跨公元混合),formatEraNames 空数组 → `无年号`,多个年号用 `、` 拼接,
    search 5 字段:name+templeName+posthumousName+eraNames[].name+dynasty,
    calculateReignYears 含负数跨公元
  - `frontend/src/services/person/scholars/scholarService.test.ts`(18 个用例):
    scholar 用 filterByDynasty 短路 OR(dynasty || dynastyPeriod 任一命中),
    sortScholars `birthYear` 用 `a.birthYear || 0` 兜底 null,`name`/`dynasty`
    走 localCompare 默认 locale + dynastyPeriod 兜底,search 覆盖 5 字段:
    name+name_en(lowercase)+schoolOfThought+dynasty+dynastyPeriod
  - `frontend/src/services/mythology/mythologyService.test.ts`(12 个用例):
    mythologyService 是少量纯函数模块。validateMythology 验证 5 必填字段
    (id/title/category/description/characters)缺失各自报错 +
    characters undefined 也算缺失 + 多个错误一起累计;filterByCategory eq 命中 /
    未命中 / 空数组;getMythologies 用 `vi.doMock('./mythologyApi') +
vi.resetModules() + 重新 await import` 拦截内部动态 import,验证透传
    `getMythologies` 返回值
  - `frontend/src/services/map/mapDataService.test.ts`(16 个用例):
    地图数据服务覆盖 MapDataCache singleflight + memo 与 MapDataService 公共方法。
    用 `vi.mock('@/utils/services/dataLoaders')` 拦截 loadJsonData,验证
    loadPlaces 走 `/data/json/places.json` + 二次走缓存 + 并发只触发一次 loader +
    抛错后不缓存允许重试,loadBoundaryMappings 返回 10 个朝代硬编码(qin→qing)
    - 二次走缓存且不调 loadJsonData,loadBoundaryData(period)走
      `/data/raw/<file>` + period 不存在返回 null + loadJsonData 抛错落 catch
      返回 null + 同 period 二次走缓存,getBoundaryDataByYear 区间命中(含边界
      `validTo`)+ 过早/过晚返回 null,clearCache(key) 只清单 key 与 clearCache()
      全清,getCacheStats 初始 loadingCount=0,全局单例 `mapDataService` 是
      `MapDataService` 实例
  - `frontend/src/features/timeline/components/SearchBar.test.tsx`(4 个用例):
    placeholder 文案 + 受控 value 改变 + onFocus 改变 border/boxShadow +
    onBlur 还原(锁定 focus 视觉反馈语义)
  - `frontend/src/layouts/Footer.test.tsx`(2 个用例):页脚版权与
    资源链接结构(纯展示组件回归基线)
  - `frontend/src/features/mythology/components/MythologyCard.test.tsx`(7 个用例):
    极薄包装委托 ContentCard,验证 title / category 主标签 / description
    显示,characters 渲染 footer tags(≤3 不溢出 / >3 显示前 3 + '+N' chip),
    characters undefined 走 `?.map` 不抛错,未知 category 仍能渲染(fallback
    defaultColor),点击 / Enter / Space 都触发 `onClick(mythology)`(继承自
    ContentCard 键盘可达)
  - `frontend/src/features/mythology/components/CategoryFilter.test.tsx`
    (5 个用例):分类筛选 chip 列表显示、选中态切换、点击触发回调
  - `frontend/src/features/mythology/components/CategoryTabs.test.tsx`
    (4 个用例):mobile / desktop 分支通过 `window.matchMedia` 控制
    `useMediaQuery` 切换 Tabs / Dropdown 形态
  - `frontend/src/features/timeline/components/EventCard.test.tsx`
    (8 个用例):timeline 事件卡片渲染 title / startYear / endYear /
    description / categories,confidence 区间显示徽章,点击触发 onClick(event)
  - `frontend/src/layouts/Sidebar/SettingsPanel/ThemeToggleButton.test.tsx`
    (5 个用例):themeStore 集成、明/暗切换 icon 反转、aria-label 国际化、
    点击触发 toggleTheme
  - `frontend/src/layouts/Sidebar/SettingsPanel/StyleSwitcherButton.test.tsx`
    (4 个用例):styleStore 集成、glass↔classic 切换、过渡时给
    `document.documentElement` 加 'style-transitioning' class 并在
    500ms 后移除(锁定切换动画 cleanup 语义)
  - `frontend/src/layouts/Sidebar/SettingsPanel/LanguageSwitcherButton.test.tsx`
    (4 个用例):langStore 集成、zh↔en 切换 icon、aria-label、点击触发回调
  - `frontend/src/pages/NotFoundPage.test.tsx`(4 个用例):
    渲染 404 + 走丢标题 + 当前路径回显;"回到时间轴" 调
    `navigate('/timeline', { replace: true })`;`history.length > 1` 时
    "返回上一页" 调 `navigate(-1)`;`history.length <= 1` 兜底跳 `/timeline`
    (`Object.defineProperty(window.history, 'length', { get })` 覆盖只读 getter)
  - `frontend/src/layouts/Sidebar/SettingsPanel/SettingsPanel.test.tsx`
    (3 个用例):极薄聚合 — `collapsed` prop 透传给三个子按钮 +
    渲染顺序 Theme → Style → Language(三个子按钮用 `vi.mock` 桩出
    `data-testid` + `data-collapsed`)
  - `frontend/src/layouts/Sidebar/NavigationSection.test.tsx`(5 个用例):
    渲染 6 个导航 label(时间轴/历代纪元/地图/人物/文化/神话)、
    点击按钮调 `navigate(path)`、`activeTab` 决定 contained vs outlined
    variant(MuiButton-contained / MuiButton-outlined class 二选一)
  - `frontend/src/layouts/Sidebar/FunctionPanel/FunctionPanel.test.tsx`
    (6 个用例):路由分发 — 5 个 case(timeline/dynasties/map/people/culture)
    各自渲染对应子面板 + 未知 activeTab 走 default 返回 null
  - `frontend/src/features/timeline/components/timeline/components/EventDetailPanel.test.tsx`
    (7 个用例):title / startYear 显示、endYear≠startYear 时显示 endYear、
    description / startDate 缺失时不渲染对应区、收藏按钮触发
    `onToggleFavorite(eventId)`、分享按钮触发 `onShare(event)`
  - `frontend/src/features/timeline/components/timeline/components/TimelineToolbar.test.tsx`
    (4 个用例):标题 + `zoomLevel.toFixed(1)` 文本、5 个按钮通过 title
    属性区分并触发对应回调、mouseEnter/mouseLeave 写入 inline style 不抛错
  - `frontend/src/layouts/Sidebar/FunctionPanel/timeline/EventTypeFilterPopover.test.tsx`
    (2 个用例):anchorEl=null 关闭 / 非空打开 + 4 个事件类型 checkbox
  - `frontend/src/layouts/Sidebar/FunctionPanel/timeline/index.test.tsx`
    (3 个用例):TimelineFunctions Popover 开关状态机 —
    初始关闭 / 点击按钮设置 anchorEl 为该按钮 / 调子 popover 的 onClose
    重置(用 act 包裹 React 18 自动 batching 触发的 state 更新)
  - `frontend/src/layouts/Sidebar/FunctionPanel/culture/CultureTypePopover.test.tsx`
    (2 个用例):6 个文化类型 checkbox(2 个 defaultChecked)
  - `frontend/src/layouts/Sidebar/FunctionPanel/culture/PeriodFilterPopover.test.tsx`
    (2 个用例):6 个时期 chip(先秦/秦汉/魏晋/隋唐/宋元/明清)
  - `frontend/src/layouts/Sidebar/FunctionPanel/culture/index.test.tsx`
    (4 个用例):CultureFunctions 两个独立 popover(文化类型 / 时期筛选)
    互不干扰开关 + onClose 独立关闭
  - `frontend/src/layouts/Sidebar/FunctionPanel/people/OccupationFilterPopover.test.tsx`
    (2 个用例):6 个职业 checkbox(均不默认选中)
  - `frontend/src/layouts/Sidebar/FunctionPanel/people/PeopleDynastyFilterPopover.test.tsx`
    (2 个用例):6 个朝代 chip(春秋战国/秦汉/魏晋南北朝/隋唐/宋元/明清)
  - `frontend/src/layouts/Sidebar/FunctionPanel/people/index.test.tsx`
    (5 个用例):PeopleFunctions 搜索框 + 两个独立 popover 开关
    (朝代/职业)互不干扰 + onClose 独立关闭
  - `frontend/src/layouts/Sidebar/FunctionPanel/dynasties/index.test.tsx`
    (6 个用例):'已展开 X / Y' 文本、expandedCount=0 时 '收起' disabled、
    expandedCount=total 时 '展开' disabled、中间状态两按钮可用、
    点击按钮调 `expandAllDynasties` / `collapseAllDynasties`
  - `frontend/src/components/ui/{ErrorBoundary,LoadingSkeleton,ResponsiveTable,ResponsiveText,MobileTableContainer,ResponsiveContainer,ScrollContainer,ResponsiveButton,ResponsiveCard,YearSettingsPopover,ResponsiveLayout,PortraitSidebar}.test.tsx`
  - `frontend/src/components/common/{PersonCard,ContentCard,TabsContainer,CommonTabs,FixedTabsPage}.test.tsx`
  - `frontend/src/components/HoverScrollContainer/HoverScrollContainer.test.tsx`
- `frontend/src/store/createFigureStore.ts`:tang/song/yuan/ming 四个朝代人物 store 工厂(§2.1 起步),
  保留每个朝代的 hook 名与公开 API(无下游改动)
- `frontend/src/store/createFigureStore.test.ts`:工厂 6 个 vitest 用例(初始值 / 写入 /
  filter 透传 / 实例隔离)

### Changed

- 内部 / 开发面向文档汇总到 `doc/` 文件夹:`ARCHITECTURE_ISSUES.md` / `ROADMAP.md` /
  `DEPLOY.md` 三份 git mv 到 `doc/`,根目录只保留 GitHub 自动识别的标准文件
  (`README.md` / `LICENSE` / `CHANGELOG.md` / `CONTRIBUTING.md` /
  `CODE_OF_CONDUCT.md` / `SECURITY.md`)。`README.md` 项目结构图与 `CONTRIBUTING.md`
  / `SECURITY.md` 内的链接同步更新指向 `./doc/...`
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
