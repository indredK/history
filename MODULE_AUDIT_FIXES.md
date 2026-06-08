# 模块审查与修复记录

> 任务要求：按模块逐一检查页面、后端业务逻辑、公共组件、国际化和响应式；第一轮修复后进行第二轮更严格复查。每修复一个问题同步记录。

## 进度

- 第一轮：进行中（当前推进至 map）
- 第二轮：待第一轮全模块完成后重新执行更严格复查
- 已修复问题计数：60

## 复扫结论

- 当前仍处于第一轮模块审查推进中；第二轮更严格复查尚未开始，不能将本任务视为完整完成。
- 本轮启动后无数据排查确认 `/map` 本身已有事件与边界数据；已修复公共代理、代理检测与集合加载兜底，后续仍需继续逐模块审查人物分朝代、公共组件、国际化和响应式。
- 验证方式按当前环境和用户约束记录到每条修复项中；未运行的 lint、type-check、测试或浏览器复查均不得作为已完成证明。

## 修复记录

### 1. 人物模块公共筛选框选中后显示英文枚举

- 轮次：第一轮
- 模块：人物页公共筛选组件、人物档案表单、神话移动端标签下拉，影响人物档案、唐/宋/元/明/三国/清等人物子模块及神话备用移动组件
- 问题：下拉菜单中展示中文 label，但选中后依赖 MUI 默认回填；当选项 value 是 `emperor`、`official`、`role` 等英文枚举时，可能在收起状态露出英文值。
- 修复：在 `PeopleFilter` 中为筛选框和排序框统一配置 `renderValue`，用当前 value 回查选项 label，保证选中态始终显示中文文案；人物档案编辑弹窗的“性别”选择框也使用同样策略，避免 `male` / `female` 在选中态外露；神话备用移动端标签下拉同步回查中文标签，避免 `mythology` / `religion` 外露。
- 响应式同步：搜索框在移动端占满一行，筛选与排序控件在移动端按两列自适应，避免窄屏挤压。

### 2. 空列表会触发公共数据加载 hook 反复请求

- 轮次：第一轮
- 模块：公共数据加载 hook，影响文化、神话、人物档案、朝代人物等使用 `useCollectionResource` 的页面
- 问题：自动加载条件只判断 `items.length === 0`。当接口合法返回空数组，或删除到空列表时，hook 会在加载完成后再次触发请求，造成重复加载和错误态抖动。
- 修复：为每个 `cacheKey` 记录一次自动加载状态，同一资源只自动触发一次；用户点击“重试”仍然可以手动重新加载。

### 3. 后端地图地点接口仍返回固定占位数据

- 轮次：第一轮
- 模块：后端地图模块
- 问题：`/places` 只返回北京、上海两个写死的模拟地点，API 模式下地图模块无法使用数据库中的地点基础数据；`/map/boundary-data/year` 的 `year` query 也没有显式转成数字。
- 修复：`MapService.getPlaces()` 接入 Prisma `place` 表并返回真实地点列表、坐标和来源 ID；`year` 参数使用 `ParseIntPipe` 解析，避免字符串年份进入业务逻辑。

### 4. 删除思想流派时未处理关联学者外键

- 轮次：第一轮
- 模块：后端文化模块
- 问题：前端提供“删除流派”基础操作，但后端直接删除 `philosophicalSchool`。当该流派已有学者引用时，数据库外键会阻止删除，导致基础删除功能失败。
- 修复：删除学派前先将关联学者的 `philosophicalSchoolId` 置空，保留学者自身的 `schoolOfThought` 文本展示，随后再删除学派记录。

### 5. 时间轴页面已实现聚合逻辑但未接入图表

- 轮次：第一轮
- 模块：前端时间轴模块
- 问题：`timelineFilters` 中已有按朝代区间聚合事件的逻辑，`EChartsTimeline` 也支持 `clusterData`，但页面始终传空数组，导致大范围时间轴的事件聚合基础功能不可用。
- 修复：在时间范围跨度较大时，将筛选后的事件与朝代传入 `buildTimelineDynastyClusters`，再交给图表渲染聚合标记；初始未缩放状态下用当前朝代范围推导默认聚合范围。

### 6. API 模式列表只加载第一页导致筛选统计不完整

- 轮次：第一轮
- 模块：前端统一数据服务，影响文化、地图、宗教、帝王、唐/宋/元/明/三国/清人物等使用 `createUnifiedService` 的模块；同步覆盖人物档案与神话独立 service。
- 问题：前端列表页按“全量数组”做本地筛选、计数和排序，但后端列表接口默认分页 `limit=20`。API 模式下数据超过 20 条时，页面只展示第一页，筛选选项和统计都不完整。
- 修复：`handleApiResponse` 保留后端分页 `meta`；统一 service 首次按兼容方式请求，发现分页后按 `limit=100` 自动翻页拉取完整集合；人物档案和神话独立 API 也接入同一全量分页拉取逻辑。

### 7. 编辑表单无法清空可选字段

- 轮次：第一轮
- 模块：人物档案、文化模块、后端人物/文化 DTO 与文化 service
- 问题：人物档案和文化编辑弹窗把空输入转换为 `undefined`，JSON 请求会省略字段；后端更新时将 `undefined` 视为“不修改”，导致用户清空字号、朝代、年份、创始人、简介、学派等字段后保存，旧值仍保留。
- 修复：前端编辑表单对空文本发送空字符串、对空数字发送 `null`；相关前端/后端类型允许 nullable 入参。文化后端写入时把空字符串规范为 `null`，学者学派字段为空时同时清空 `philosophicalSchoolId` 和 `schoolOfThought`。

### 8. 朝代人物 API 字段和枚举映射不完整

- 轮次：第一轮
- 模块：人物页唐朝人物、三国人物子模块
- 问题：唐朝人物转换器只读取静态数据的 `position/roles`，API 模式下忽略后端 `role` 且重新生成 id，导致角色筛选和详情 key 不稳定；三国后端支持 `advisor` 角色，但前端类型、标签和筛选选项缺失。
- 修复：唐朝人物转换器优先保留后端 `id` 和 `role`，年份用 `??` 保留有效 0 值；三国人物增加 `advisor` 类型、中文标签、排序权重和筛选选项。

### 9. 地图地点 API 返回结构未被前端兼容

- 轮次：第一轮
- 模块：前端地图服务
- 问题：后端 `/places` 已返回 `id`、`canonical_name` 和 GeoJSON 风格 `location`，但前端转换器仍按静态 JSON 的 `latitude/longitude` 生成坐标并重建 id，API 模式下地点 id 和坐标可能错误。
- 修复：地图地点转换器同时兼容后端 DTO 与静态 JSON：优先使用后端 id、`canonical_name` 和 `location.coordinates`，仅在静态数据字段存在时回退经纬度组装。

### 10. 疆域页边界资源路径和 ECharts 颜色不兼容

- 轮次：第一轮
- 模块：前端疆域页面
- 问题：`DynastyBoundaryMap` 使用裸 `/data/map/boundaries/...` 请求资源，部署在非根路径时会加载失败；同时把 CSS 变量如 `var(--color-error)` 直接拼接透明度后传给 ECharts，生成的颜色字符串无法被 canvas 稳定解析。
- 修复：边界 GeoJSON 改用统一 `loadJsonData`，自动处理 `BASE_URL`；朝代疆域色改为 ECharts 可解析的真实 hex 颜色，并在全部边界数据加载失败时显示明确错误态。

### 11. 宗教关系图布尔查询和空结果态不完整

- 轮次：第一轮
- 模块：后端宗教模块、前端宗教关系图
- 问题：`includeNodeDetails=false` 作为 query string 进入后端时会被当成 truthy，无法关闭边的节点详情；前端搜索/筛选清空高亮时没有恢复节点透明度，无匹配结果时只剩空白画布。
- 修复：宗教查询 DTO 显式将 `"true"` / `"false"` 转为布尔值并校验；前端高亮 effect 在空高亮集合时恢复节点样式，并在筛选无结果时显示中文空状态。

### 12. 赛博皇帝页移动端无法切换朝代和帝王

- 轮次：第一轮
- 模块：前端赛博皇帝页面
- 问题：桌面端依赖左右两个轮盘菜单选择朝代和帝王，但轮盘在 700px 以下会隐藏；页面没有移动端替代控件，手机上只能查看默认档案。
- 修复：增加仅小屏显示的朝代/帝王选择栏，复用当前状态和数据；700px 以下显示两列，极窄屏切为单列，并保证选中态展示中文朝代与帝王名称。

### 13. 公共详情响应解析会把 null 数据误当成业务对象

- 轮次：第一轮
- 模块：前端公共数据加载工具，影响所有通过 `handleSingleApiResponse` 读取详情的 service
- 问题：后端如果返回 `{ success: true, data: null }` 表示详情不存在或已删除，解析函数因为用 truthy 判断 `backendData.data`，会跳到“直接返回数据”分支，把整个响应包装对象当成业务对象交给转换器。
- 修复：详情解析改为判断响应对象是否拥有 `data` 字段，保留合法的 `null` / 空值语义，避免详情页或备用查询拿到错误包装对象。

### 14. 朝代人物 service 声明支持详情但后端缺少详情路由

- 轮次：第一轮
- 模块：后端唐/宋/元/明/三国/清人物子模块，影响对应前端 API mode 的 `getById`
- 问题：前端朝代人物 service 均以 `hasGetById: true` 创建，会请求 `/tang-figures/:id`、`/song-figures/:id` 等详情接口；后端 controller 只有列表接口，API 模式下详情查询会 404。
- 修复：为唐、宋、元、明、三国、清兼容端点补齐 `GET :id` 路由；service 通过对应 Prisma 表按 id 查询，复用现有人物 JSON 字段转换逻辑，并在不存在时返回 404。

### 15. 公共固定标签页的 tabsProps 配置没有生效

- 轮次：第一轮
- 模块：前端公共组件 `FixedTabsPage` / `CommonTabs`，影响人物、文化、神话等复用固定标签页的页面
- 问题：`FixedTabsPageProps` 暴露了 `tabsProps`，但渲染时没有传给 `CommonTabs`；`CommonTabs` 也没有接收 `variant`、`scrollButtons`、`allowScrollButtonsMobile`，导致公共组件配置不可用。
- 修复：为 `CommonTabs` 补齐这些 MUI Tabs 参数并保持默认行为不变；`FixedTabsPage` 将 `tabsProps` 透传给 `CommonTabs`，公共标签组件恢复可配置性。

### 16. 清朝统治者排序下拉值与 service 类型不一致

- 轮次：第一轮
- 模块：前端人物页清朝统治者子模块
- 问题：清朝统治者 store 默认排序和 service 实现使用 `reignStart`，但页面排序下拉的“按时间顺序”选项 value 是 `chronological`；用户选择该项后 service 不识别，排序会退回原数组顺序，选中态也与默认值不一致。
- 修复：将“按时间顺序”选项 value 改为 `reignStart`，与 `QingRulerSortBy`、store 默认值和排序实现保持一致。

### 17. 帝王 API 模式丢失朝代名称导致筛选全是未知

- 轮次：第一轮
- 模块：后端帝王模块、前端帝王 service 转换器
- 问题：后端 `EmperorService` 查询时 include 了 `dynasty`，但转换 DTO 时把关联朝代丢弃；前端 API 转换器依赖 `dynasty.name`，因此 API 模式下帝王朝代会变成“未知”，朝代筛选和排序基础功能失真。
- 修复：后端帝王 DTO 增加轻量 `dynasty` / `dynastyName` 展示字段，service 转换时保留朝代 id 和名称；前端转换器兼容对象、字符串和 `dynastyName` 三种朝代形态，并为 `reignEnd` 增加空值兜底；严格复扫时同步将 Prisma payload 类型改为从 generated models barrel 导入，避免 namespace 类型引用错误。

### 18. 时间轴事件并发加载后顺序不稳定

- 轮次：第一轮
- 模块：前端时间轴 service，影响时间轴页和地图工作台事件数据
- 问题：`timelineApi` 按事件类型并发加载多个 JSON 文件，并在每个 Promise 完成时 push 到同一个数组；最终事件顺序取决于文件返回先后，默认展示和地图事件计数上下文会出现不稳定顺序。
- 修复：所有分类文件加载完成后，统一按 `startYear`、`endYear`、中文标题排序，再返回给页面和地图工作台。

### 19. 赛博帝王页静态数据加载全量依赖且缺少错误/空状态

- 轮次：第一轮
- 模块：前端赛博帝王页面与数据 hook
- 问题：帝王档案从 `response1-9.json` 构建，原逻辑用 `Promise.all`，任意一个静态文件失败都会导致整页加载失败；hook 只在控制台输出错误，页面会进入无数据但无提示的状态。
- 修复：年表文件改为 `Promise.allSettled` 单文件降级，失败文件只记录 warning，其余文件仍可展示；数据 hook 增加 `error` 和 `reload`，页面补齐中文错误态、重试按钮和空数据态。

### 20. 朝代页错误兜底文案仍有英文

- 轮次：第一轮
- 模块：前端朝代年表明细与朝代甘特图
- 问题：朝代明细空加载错误使用 `No data loaded from response files`，异常兜底使用 `Unknown error`；甘特图加载异常兜底也使用英文，和页面中文国际化不一致。
- 修复：将这些用户可见错误兜底统一改为中文“未从年表响应文件中加载到数据”和“未知错误”。

### 21. 公共静态资源加载错误会向页面透出英文

- 轮次：第一轮
- 模块：前端公共数据加载工具，影响地图、朝代、时间轴、神话等静态 JSON 资源页面
- 问题：`loadJsonData` 和 `retryLoad` 抛出的基础错误文案是英文；多个页面会直接把错误 message 放进中文错误态，资源 404 或重试失败时会出现中英文混杂。
- 修复：公共资源加载失败和重试失败文案改为中文，保留资源路径和 HTTP 状态，方便排查且符合页面国际化。

### 22. 后端地图边界接口仍返回模拟占位数据

- 轮次：第一轮
- 模块：后端地图模块
- 问题：地图后端的 `/map/boundary-data`、`/map/boundary-data/year`、`/map/boundary-mappings` 等接口仍返回“模拟边界数据”和 `ancient/medieval` 占位映射，API 端没有基础疆域数据能力。
- 修复：后端复用现有 `frontend/public/data/map/boundaries` GeoJSON 文件，补齐真实朝代边界映射、按时期/年份读取、常用边界预加载、缓存清理和缓存统计；未命中时期、年份或文件时返回明确中文 404 错误。

### 23. 旧版朝代列表遗留英文错误兜底

- 轮次：第二轮
- 模块：前端朝代模块遗留列表组件
- 问题：严格复扫时发现 `DynastiesList.tsx` 仍有 `Failed to load dynasties config` 和 `Unknown error` 用户可见兜底；即使当前入口主要使用 `DynastiesListFlat`，同模块备用组件仍不符合中文国际化。
- 修复：将配置加载失败和未知异常兜底改为中文。

### 24. 服务转换器在 exactOptionalPropertyTypes 下显式写入 undefined

- 轮次：第二轮
- 模块：前端地图、时间轴、学校、学者、人物档案、唐朝人物、宗教 service
- 问题：前端开启 `exactOptionalPropertyTypes`，部分转换器在对象字面量中写入 `description: undefined`、`createdAt: undefined`、`faction: undefined`、`message: undefined` 等字段，类型语义不稳定，也会把“字段缺省”和“字段存在但为空”混淆。
- 修复：地图地点、时间轴事件、学校、学者、人物档案、唐朝人物转换器改为条件赋值或 nullable 语义；宗教 API 成功返回省略 `message` 字段。时间轴转换器同时保留 map focus 和 source id 字段，避免转换时丢数据。

### 25. Prisma payload 类型从错误 namespace 引用

- 轮次：第二轮
- 模块：后端帝王模块、宗教模块
- 问题：严格复扫发现 `EmperorGetPayload`、`ReligionEdgeGetPayload` 存在于 generated models barrel，而不是当前导入的 `Prisma` namespace；直接写 `Prisma.EmperorGetPayload` / `Prisma.ReligionEdgeGetPayload` 可能导致类型引用错误。
- 修复：改为从 `../generated/prisma/models` 导入对应 payload 类型，保留 `Prisma` namespace 只用于 where/input 等实际存在的类型。

### 26. 后端详情与保存异常仍返回英文文案

- 轮次：第二轮
- 模块：后端帝王、文化、事件、神话、人物档案、朝代、唐/宋/元/明/三国/清人物模块
- 问题：严格复扫发现多个详情接口和人物档案保存校验仍抛出英文 `NotFoundException` / `BadRequestException`，这些 message 会进入 API 响应并可能被前端中文错误态直接展示。
- 修复：将相关未找到记录、人物姓名必填、学者关联学派不存在等业务异常统一改为中文文案，保证页面错误态和后端响应的基础国际化一致。

### 27. 宋/元人物 store 注入空数据 helper

- 轮次：第二轮
- 模块：前端人物页宋朝人物、元朝人物状态管理
- 问题：严格复扫发现宋/元人物 store 注入的是 `songFigureServiceHelper` / `yuanFigureServiceHelper`，其中 `getAll` / `getById` 仍是空数组和空详情占位。当前工厂主要使用筛选排序方法，但与唐/明 store 注入完整 service 的模式不一致，后续工厂若复用数据能力会导致基础列表为空。
- 修复：宋/元人物 store 改为注入完整的 `songFigureService` / `yuanFigureService`，保留原筛选排序能力，同时保证 store 依赖具备真实 API/JSON 数据能力。

### 28. 全局 API 成功响应默认 message 为英文

- 轮次：第二轮
- 模块：后端公共响应 DTO / 全局响应拦截器
- 问题：全局 `TransformInterceptor` 会用 `ApiResponseDto.success(data)` 包装普通响应，但默认 message 是英文 `Success`；即使前端多数场景不展示该字段，API 基础响应仍不符合中文国际化。
- 修复：将公共成功响应默认 message 改为“操作成功”，Swagger 示例和相关单元测试期望同步改为中文，保持响应结构不变。

### 29. 三国人物后端角色查询白名单缺少官员

- 轮次：第二轮
- 模块：后端三国人物查询 DTO
- 问题：前端三国人物类型、标签和筛选选项都包含 `official`（官员），但后端 `SanguoFigureQueryDto` 的 role 枚举和校验白名单缺少该值；API 调用带 `role=official` 时会被校验拒绝，前后端契约不完整。
- 修复：后端三国人物 role 枚举和 `@IsIn` 校验加入 `official`，并顺手移除 `name` 字段上重复的 `@IsOptional()`。

### 30. 人物档案前端排序项与后端 sortBy 白名单不一致

- 轮次：第二轮
- 模块：前端人物档案、后端人物查询 DTO / service
- 问题：人物档案前端提供“按朝代”排序，store 的 `PersonSortBy` 也包含 `dynasty`，但后端 `PersonQueryDto.sortBy` 白名单和 SQL 排序列映射缺少 `dynasty`；API 侧若复用该排序参数会被校验拒绝或无法排序。
- 修复：后端 `sortBy` 枚举、`@IsIn` 校验和 `SORT_COLUMN_MAP` 同步加入 `dynasty`，与前端排序项保持一致。

### 31. 前端开发服务器依赖扫描无法解析删除图标

- 轮次：开发启动修复
- 模块：前端神话模块卡片组件、开发启动流程
- 问题：Vite dependency scan 报错无法解析 `@mui/icons-material/DeleteOutline`，来源于 `MythologyCard.tsx`。当前安装的 MUI 图标包存在 `DeleteOutlined` / `DeleteOutlineOutlined` 等实际子路径，但没有 `DeleteOutline` 子路径，导致前端开发服务器启动阶段跳过依赖预构建并报错。
- 修复：将神话卡片删除按钮图标导入切换为当前包可解析的 `DeleteOutlined`，并同步组件使用名；额外扫描前端所有 `@mui/icons-material/*` 子路径，未发现其他缺失图标。
- 验证：后端单独启动编译 0 errors 并正常监听；前端单独启动不再出现依赖扫描报错；根目录 `bun run dev` 联动启动通过工具校验、后端 Nest 启动和前端 Vite 监听后已手动停止。

### 32. 人物公共组件 barrel 漏导出筛选组件

- 轮次：开发启动修复
- 模块：前端人物模块公共组件导出、人物档案页面
- 问题：浏览器报错 `common/index.ts` 不提供 `PeopleFilter` 命名导出；`PeopleArchiveContent.tsx` 从 `../common` 导入筛选组件，但人物公共组件 barrel 只导出了集合、网格、卡片和 hook，漏掉 `PeopleFilter`。
- 修复：在人物公共组件 `index.ts` 中补充导出 `PeopleFilter`；同目录公共详情弹窗及其工具函数也同步加入 barrel，避免后续公共组件从目录导入时再出现同类漏导出。
- 验证：静态扫描本地目录 barrel 命名导入，未发现缺失导出；前端开发服务器上请求 Vite 转换后的 `common/index.ts`，确认已导出 `PeopleFilter`，`PeopleArchiveContent.tsx` 也能从该 barrel 导入。

### 33. 启动后部分列表页一直无数据或卡在加载态

- 轮次：浏览器联调修复
- 模块：前端公共集合加载 hook，影响人物档案、神话故事、文化等复用 `useCollectionResource` 的页面
- 问题：浏览器检查发现地图、朝代、时间轴、帝王已有数据，但人物档案显示 `共 0 位人物`，神话故事分类全为 0 且一度卡在 skeleton。静态 JSON 资源实际可访问（人物 41 条、神话 42 条），根因是公共 hook 依赖 ahooks `useRequest(cacheKey)`：命中缓存时不会触发外部 Zustand 的 `setItems`，React 开发模式 StrictMode 模拟卸载时又可能取消请求但保留自动加载 guard，导致第二次挂载不再加载。
- 修复：`useCollectionResource` 改为自管请求流程，显式维护挂载状态、请求序号、卸载复位和外部 store 写入；卸载时重置自动加载标记，确保 StrictMode 下会重新触发真实加载。神话搜索框同步将旧版 `InputProps` 改为 MUI 当前可用的 `slotProps.input`，避免控制台 DOM prop warning。
- 验证：接管 Browser 后复查页面，人物档案恢复 `共 41 位人物`，神话故事恢复 `全部 42` / `当前 42 条` / `6 个分类`，文化页、时间轴页仍正常显示数据。

### 34. 朝代模块后端仍停留在只读接口且 DTO 字段漂移

- 轮次：阶段一模块推进
- 模块：后端朝代模块 `dynasty`
- 问题：`dynasty` controller/service 只有列表和详情接口，朝代作为地图边界、时间轴、帝王筛选的基础维度，却无法新增、编辑或删除；同时 `DynastyDto` 仍声明 Prisma schema 中不存在的 `name_en`、`color` 字段，导致 Swagger 契约与真实数据结构漂移。
- 修复：补齐 `POST /dynasties`、`PATCH /dynasties/:id`、`DELETE /dynasties/:id`，新增 `CreateDynastyDto` / `UpdateDynastyDto`，并在 service 中加入重名校验、开始/结束年份区间校验、可选文本字段清空为 `null` 的规范化逻辑；`DynastyDto` 同步移除不存在的 `name_en` / `color` 字段。
- 验证：本轮按仓库要求采用静态代码审查与单测文件补齐，未启动测试或开发服务器；`dynasty.service.spec.ts` 已补 create/update/remove、冲突校验和年份校验场景，文档状态矩阵同步更新为后端 CRUD。

### 35. 事件模块多标签类型被单值精确匹配

- 轮次：阶段一模块推进
- 模块：后端事件模块、前端时间轴/地图事件筛选
- 问题：`backend/prisma/seed-data/events.json` 中大量 `eventType` 是逗号分隔多标签，例如 `war,civil_war`、`political_event,dynasty_founding`，但后端 `/events` 和 `/timeline` 以精确相等筛选，导致 `eventType=war` 漏掉多数战争事件；前端时间轴/地图也只读取第一个事件标签，地图筛选和事件详情会暴露英文代码值。
- 修复：后端事件 service 新增完整标签边界匹配，`war` 可匹配 `war,civil_war` 且避免普通子串误命中；事件查询 DTO 放宽为真实标签格式并同步 `/timeline`。前端新增统一事件标签拆分与中文分类工具，时间轴分类、搜索、地图事件筛选、地图事件详情和事件卡片统一显示中文分类，并保留静态 JSON 原始 `categories`。
- 验证：按本轮用户要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器；`event.service.spec.ts` 已同步补多标签筛选期望，供后续测试运行验证。

### 36. 事件模块后端仍缺少 CRUD 与关联详情

- 轮次：阶段一模块推进
- 模块：后端事件模块 `event`
- 问题：事件模块原先只有 `GET /events`、`GET /events/:id` 和 `GET /timeline`，且详情接口会剥离 `participants` / `locations`，既无法新增、编辑、删除事件，也无法通过 API 拿到事件关联的人物、地点、来源基础数据。
- 修复：补齐 `POST /events`、`PATCH /events/:id`、`DELETE /events/:id`，新增 `CreateEventDto` / `UpdateEventDto`，支持事件标题、年份、描述、逗号分隔标签以及 `participants / locations / sourceIds` 关联输入；`findOne` 改为返回扩展详情 DTO，包含参与人物、地点和来源；service 内补充标题非空、年份区间、重复关联、引用存在性校验，并在更新时支持清空可选字段与整组替换关联关系。
- 验证：按本轮用户要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器；`event.service.spec.ts` 已改为覆盖详情关联、create/update/remove、引用校验和多标签筛选场景，供后续测试运行验证。

### 37. 地图首屏默认聚焦到无疆域数据的夏朝

- 轮次：浏览器联调修复
- 模块：前端地图工作台、历史疆域图层
- 问题：开发服务器启动后根路径跳转 `/map`，页面有 117 个事件和地图 canvas，但默认选中第一条朝代数据“夏朝 / 公元前2070年”。现有疆域边界文件从秦朝开始，导致控制台持续提示未找到 `-2070` 边界数据，用户会误以为地图首屏没有数据。
- 修复：地图默认朝代选择改为优先选中第一个具备边界数据年份的朝代，当前为“秦朝 / 公元前221年”；仍保留完整朝代与事件数据，只改变首屏可视聚焦点。
- 验证：启动前端开发服务器并接管 Browser，根路径进入 `/map` 后显示 `117 个事件`，状态条显示 `疆域时间：公元前221年`、`当前聚焦：秦朝`，地图 canvas 尺寸正常。

### 38. 时间轴数据加载完成后首帧仍以空事件渲染

- 轮次：浏览器联调修复
- 模块：前端时间轴页面、事件管理面板
- 问题：时间轴请求完成后先用空的 `managedEvents` 渲染，随后 effect 才把请求数据写入本地管理态；慢设备或热更新后容易出现“启动后没有数据”的空白首帧。事件模块后端 CRUD 已补，但前端没有基础新增/编辑/删除入口；窄宽布局下图表和管理面板纵向堆叠还会被外层 `overflow: hidden` 裁掉。
- 修复：时间轴展示源在管理态初始化前直接使用请求返回的事件数据，初始化后再切换到本地管理态；新增 `EventManager`，支持事件搜索、详情、创建、编辑、删除，并在 mock/json 与 API 模式下接入 `createEvent` / `updateEvent` / `deleteEvent`；时间轴页外层允许滚动，避免响应式堆叠后内容被裁切。
- 验证：Browser 打开 `/timeline` 后直接显示 `窗口内 117 / 共 117 个事件`，事件管理面板存在并渲染 80 条列表截断结果。

### 39. 公共加载 hook 卸载收尾与神话 mock 写入仍有运行时风险

- 轮次：浏览器联调修复
- 模块：公共集合加载 hook、神话 service
- 问题：`useCollectionResource` 在卸载时直接调用外部 `setLoading(false)`，StrictMode/热更新期间可能把旧实例状态写回共享 store；神话 mock 写入入口假定 input 一定存在，旧调用链或热更新状态下传入空值会触发 `Cannot read properties of undefined`。
- 修复：公共 hook 卸载时只更新内部挂载标记和请求序号，不再写外部 loading；神话 `normalizeInput` 增加运行时空值防护和字段规范化，避免空输入导致整页崩溃。
- 验证：前端开发服务器热更新后未再出现新的神话空输入崩溃；本项未运行 lint/type-check。

### 40. ECharts 时间轴可能在 0 宽高容器上初始化

- 轮次：浏览器联调修复
- 模块：前端时间轴图表 `EChartsTimeline`
- 问题：浏览器联调时 Vite 终端出现 `Can't get DOM width or height` warning。时间轴图表在容器布局尚未稳定时立即 `echarts.init`，可能导致首帧空画布或需要后续 resize 才恢复。
- 修复：ECharts 实例延迟到容器 `clientWidth/clientHeight` 均非 0 后初始化；`ResizeObserver` 只在有效尺寸时触发 resize，并在实例创建后触发一次 option 同步。
- 验证：采用静态代码审查和开发服务器热更新观察；未运行 lint/type-check。

### 41. 事件编辑空关系字段会误触发整组关联替换

- 轮次：阶段一模块推进
- 模块：前端时间轴事件管理面板、后端事件更新契约
- 问题：后端 `PATCH /events/:id` 将 `participants`、`locations`、`sourceIds` 字段的存在视为整组替换；前端事件编辑表单原先即使文本域为空也会提交空数组，编辑没有关系输入的事件时可能误清空后端已有参与人物、地点或来源关联。
- 修复：事件表单构造入参时仅在当前文本域有内容，或原事件本身已有对应关系文本时提交关系字段；这样新增事件的空关系保持“不关联”，编辑空关系事件时省略字段保留后端原值，编辑已有关系事件时清空文本仍可显式清空该组关联。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 42. 人物档案保存缺少年份与可信度业务校验

- 轮次：阶段一模块推进
- 模块：后端人物模块、前端人物档案表单
- 问题：人物档案后端 CRUD 虽已具备基础写入能力，但 service 层没有校验卒年是否早于生年；前端 mock/json 模式也会绕过 Nest DTO 校验，可信度超出 0-1 或生卒年倒置时仍可能保存。保存失败时错误只写到页面外层，弹窗内没有就地提示。
- 修复：`PersonService` 新增生卒年和可信度业务校验，统一返回中文 `BadRequestException`；人物表单保存前执行同样规则，并在弹窗内展示中文错误提示；打开/关闭表单时清理旧错误，API 保存/删除异常也规范为中文兜底。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 43. 人物 service 单测仍 mock 旧 Prisma delegate

- 轮次：阶段一模块推进
- 模块：后端人物模块测试覆盖
- 问题：`PersonService` 当前实现已切换到 `prisma.client.$queryRaw/$executeRaw` 访问 `persons` 原生 SQL 表，但 `person.service.spec.ts` 仍 mock `prisma.person.findMany/findUnique`，测试覆盖与真实实现脱节，后续运行测试会在基础服务 mock 层失真。
- 修复：重写人物 service spec 的 Prisma mock 为 `client.$queryRaw/$executeRaw`，覆盖分页查询 SQL 路径、JSON 字段解析、详情查询、未找到异常、创建/更新校验和可选文本清空语义。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 44. 人物可信度空值可能显示为 0%

- 轮次：阶段一模块推进
- 模块：前端人物档案详情、人物 common 类型契约
- 问题：人物类型允许 `confidence` 为 `null`，mock 模式下清空可信度后详情弹窗只判断 `!== undefined`，会把 `null` 当作 0 参与百分比计算并显示“可信度：0%”；同时 `CommonPersonSchema` 未声明 nullable 字段，和接口类型、后端返回契约不一致。
- 修复：详情弹窗展示可信度时同时排除 `undefined` 和 `null`；`CommonPersonSchema` 中姓名扩展、朝代、性别、生卒年月、简介、事件、来源、可信度等 nullable 字段同步允许 `null`。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 45. 帝王静态服务会把非帝王人物混入列表

- 轮次：阶段一模块推进
- 模块：前端帝王 service、人物页帝王 tab
- 问题：帝王前端 mock 数据复用 `persons.json`，原转换器没有按 `roles` 过滤 `emperor`，会把普通人物转换成“未知”朝代帝王；同时静态映射缺少刘邦、李世民、忽必烈、朱元璋、康熙帝、乾隆帝等真实姓名，导致静态帝王朝代、颜色和排序不完整。
- 修复：帝王服务覆盖 `getAll/getById/getEmperors/getEmperorById`，只透出可展示帝王；转换器显式读取 `roles` 并补全主要帝王姓名到朝代、庙号、功绩和争议映射，汉武帝朝代统一为“西汉”；朝代筛选选项按历史顺序排序。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 46. 帝王 API 的空退位年份和历史评价结构被错误归一化

- 轮次：阶段一模块推进
- 模块：前端帝王 service、帝王卡片与详情弹窗、帝王类型契约
- 问题：后端 `Emperor.reignEnd` 可为 `null`，前端类型却声明为必填 number，转换器还会把 `reignEnd: null` 回退为 `deathYear` 或 `reignStart`，导致卡片/详情显示伪造的结束年份或“在位 0 年”；后端 `historicalEvaluation` 使用 `summary/positives/negatives/impact`，前端只读 `content`，导致评价数据无法正确展示。
- 修复：前端 `Emperor` / `EraName` / Zod schema 允许 nullable 结束年份；`formatReignPeriod` 对未知结束年份显示“未知”，详情弹窗不再显示在位年数 chip，年号结束缺失时也显示“未知”；评价归一化兼容 `summary/positives/negatives/impact` 并合成为中文评价内容。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 47. 帝王后端查询 DTO 和 service spec 仍按旧契约维护

- 轮次：阶段一模块推进
- 模块：后端帝王模块 DTO / service spec
- 问题：`EmperorQueryDto` 的 `name`、`dynastyName` 缺少字符串校验；`emperor.service.spec.ts` 仍断言返回时剥离 `dynasty`，但当前后端 DTO 已保留 `dynasty` 和 `dynastyName` 供前端筛选/展示，测试覆盖与真实契约不一致。
- 修复：为 `name`、`dynastyName` 补齐 `@IsString()`；更新 service spec 说明和断言，改为验证 `dynasty` / `dynastyName` 展示字段、JSON 解析、详情查询和未找到异常。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 48. 宗教图前端 API 入口绕过主图接口导致图谱可能为空

- 轮次：阶段一模块推进
- 模块：前端宗教关系 service、后端宗教兼容接口
- 问题：前端 `religionApi` 通过统一 service 读取 `/religions`，而兼容 controller 返回 `{ data: [graph] }` 后还会被全局响应拦截器包装；列表响应处理可能把整个包装对象当作 graph 交给转换器，API 模式下最终得到空节点/空边。真实主接口 `/religion/graph` 已能直接返回单个图谱对象，却没有被前端优先使用。
- 修复：`religionApi` 改为 API 模式直接请求 `/religion/graph` 并用 `handleSingleApiResponse` 解析；mock 模式直接读取 `religions.json`，保留 `getAll()` 返回 `[graph]` 的兼容形态；API 失败时以中文日志回退静态图谱。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 49. 宗教查询与搜索高亮契约不完整

- 轮次：阶段一模块推进
- 模块：后端宗教 DTO / controller、前端宗教 store
- 问题：宗教兼容详情接口返回类型仍写 `any`，`ReligionGraphQueryDto.period` 缺少字符串校验；前端节点搜索筛选会匹配描述，但高亮集合只匹配名称和称号，出现“描述命中但节点不高亮”的交互错位。
- 修复：兼容详情接口返回类型改为 `ReligionNodeDto | null`；`period` 补 `@IsString()`；搜索高亮逻辑同步纳入节点描述字段，与筛选结果保持一致。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 50. 文化模块保存缺少基础业务校验与弹窗内错误态

- 轮次：阶段一模块推进
- 模块：后端文化模块、前端文化编辑弹窗
- 问题：学者/思想流派保存时 service 层未拦截空名称；学者卒年早于生年也可进入写入路径，且更新时只改一个年份可能绕过校验。前端文化表单会把非法数字静默转为 `null`，保存失败错误显示在弹窗背后的页面区域，旧错误在重新打开表单时也可能残留。
- 修复：后端 culture service 新增中文 `BadRequestException` 业务校验，更新学者时先合并旧生卒年再判断；DTO 补 `@IsNotEmpty()`、数字 `@Type(() => Number)` 和字符串数组元素校验；前端 `CultureEditDialog` 增加弹窗内 Alert、本地数字/生卒年校验，页面保存/删除异常统一中文兜底并在打开/关闭弹窗时清理旧错误。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器；`culture.service.spec.ts` 已补保存校验期望，供后续测试运行验证。

### 51. 文化详情空字段与年份展示语义不稳

- 轮次：阶段一模块推进
- 模块：前端文化详情与学者卡片/详情
- 问题：学者生卒年展示使用 truthy 判断，年份为 `0` 或只缺一端时会被误隐藏；学派详情无简介或无分节内容时仍可能渲染空段落和分割线；创立年份为负数时会显示成 `公元-551年`，不符合中文历史年份表达。
- 修复：学者卡片和详情改用 `null/undefined` 语义判断并支持单端未知年份；学派详情只渲染有内容的分节，英文名为空不再占位；创立年份统一格式化为“公元前 N 年 / 公元 N 年”。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 52. 神话保存分类契约与错误态不一致

- 轮次：阶段一模块推进
- 模块：后端神话模块、前端神话表单
- 问题：神话后端 DTO 和 service 未强制标题、分类、描述非空；更新时可把标题或描述写成空字符串，非法分类也可能进入数据库，随后前端分类统计和筛选会失真。后端 service 已将 legacy 分类别名归一到中文，但 spec 仍按旧 `creation` 分类断言；前端表单/删除弹窗关闭时也会残留上一次保存或删除错误。
- 修复：`CreateMythologyDto` 增加中文校验消息、分类白名单和字符串数组元素校验；`MythologyService` 写入时拒绝空标题、空描述和非法分类，读取 legacy 分类时统一显示中文分类；`mythology.service.spec.ts` 对齐中文分类契约并补保存校验期望；前端神话表单将保存错误提升到弹窗顶部 Alert，关闭表单和删除确认时同步清理旧错误。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 53. 地图启动页事件数据加载成功但事件点层为空

- 轮次：阶段一模块推进 / 浏览器现场复核
- 模块：前端地图工作台、地图事件地点解析
- 问题：根路径启动后进入 `/map`。静态数据实际已加载 117 条事件、39 个朝代和 21 个地点，首屏疆域已能稳定落到秦朝边界，但默认事件点只跟随当前朝代；秦朝静态事件数为 0，事件点层显示为空。同时静态时间轴事件缺少 `rawLocations/mapLocationHints`，地图只能按这两个字段解析地点，即使打开全部事件也会解析出 0 个点。
- 修复：保留秦朝作为首屏默认疆域，确保启动后立即有可用边界快照；地图工作台默认开启“显示全部事件”，首屏不再因秦朝事件数为 0 而隐藏事件点；`resolveEventLocations` 在事件缺少显式地点字段时，从事件标题、描述和参与者文本中匹配地点库的中文主名/别名，作为静态数据兜底解析，不覆盖 API 模式提供的精确地点。
- 验证：已接管 Browser 读取当前页和控制台，确认时间轴页可见 117 条事件；Browser reload 因安全策略被拦截，后续按用户要求未启动服务。静态数据脚本确认兜底解析可从 117 条事件中得到 37 个有地点事件、43 个事件点。本轮未运行测试、lint 或开发服务器。

### 54. 地图后端边界与地点查询契约不完整

- 轮次：阶段一模块推进
- 模块：后端地图模块 `map`
- 问题：`/map/boundary-data` 直接读取裸 `period` 字符串，缺失空值、大小写和白名单校验；Swagger 也没有 map/places 标签和接口说明。`PlaceQueryDto` 已存在但没有被 controller 使用，keyword、经纬度范围查询在契约层可见但业务层无效。预加载接口也未包含首屏默认会用到的秦/汉边界。
- 修复：新增 `BoundaryPeriodQueryDto` / `BoundaryYearQueryDto`，统一校验边界时期和年份；`MapController` 接入 `PlaceQueryDto`，`MapService.getPlaces()` 支持 keyword、lon_range、lat_range 过滤并归一化反向范围；map/places controller 补齐 Swagger tags、operation、response；预加载同步加入秦、汉边界，避免首屏默认边界不进缓存。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 55. 地图前端边界资源、年份输入和 tooltip 仍有兜底缺口

- 轮次：阶段一模块推进
- 模块：前端地图工作台、地图边界组件、地图数据服务
- 问题：前端本地 `preloadCommonData()` 仍只预加载唐/宋/明/清，与首屏默认秦朝边界不一致；地图工作台年份输入若出现非有限数字或开始/结束反填，会把事件筛到异常状态；`EChartsMap` / `DynastyBoundaryMap` tooltip 直接拼接 HTML，地点名、事件名或边界属性中若含特殊字符会污染提示内容；`DynastyBoundaryMap` 仍使用裸 `/data/map/boundaries/...` 路径，非根路径部署时可能加载失败。
- 修复：前端地图数据服务补齐秦/汉边界预加载并对空 period、非有限年份做中文 warning 兜底；工作台年份过滤改为安全解析并自动归一化反向范围；两个 ECharts 地图 tooltip 统一转义动态文本；朝代疆域组件改用 `MAP_BOUNDARIES_DATA_PATH` + `loadJsonData`，同时补齐受控选中朝代 effect 依赖。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 56. 地图 service 转换器仍残留 any 类型

- 轮次：阶段一模块推进
- 模块：前端地图 service、地图数据缓存
- 问题：`mapApi` 的地点转换器以 `any` 读取 API/JSON 原始数据，`mapDataService` 缓存也以 `Map<string, any>` 存储数据；在 `exactOptionalPropertyTypes` 和后续类型收紧场景下，地点 id、坐标、来源字段的字段读取容易绕过类型收口。
- 修复：地图地点转换器改为 `unknown` 输入，新增 `isRecord`、`readString`、`readNumber`、`readStringArray` 和 `readPointLocation` 收口原始数据；地图缓存改为 `unknown` 存储并在泛型 `get<T>()` 出口处断言，避免 map 模块继续扩散 `any`。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 57. 地图工作台窄屏布局仍会裁切控制面板

- 轮次：阶段一模块推进
- 模块：前端地图工作台响应式样式
- 问题：`MapWorkbench` 外层固定 `height: 100%` 且 `overflow: hidden`，筛选面板、状态条、右侧工具栏和时间轴 dock 都是绝对定位；1024px 以下只缩小筛选面板宽度，没有把这些控件改为可滚动的正常流布局。手机或窄屏下控件容易互相遮挡，时间轴与筛选项也可能被裁切。
- 修复：1024px 以下将工作台改为纵向 flex + 可滚动布局，筛选面板、地图舞台、状态条/工具栏、时间轴 dock 进入正常流；地图舞台保留 58vh 可视高度。640px 以下进一步收窄内边距，筛选年份和事件类型改为单列，允许“显示全部事件”等行内复选项换行。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 58. 朝代疆域图错误重试依赖整页刷新且未释放图表实例

- 轮次：阶段一模块推进
- 模块：前端朝代疆域图 `DynastyBoundaryMap`
- 问题：朝代疆域图加载失败时错误态“重试”直接调用 `window.location.reload()`，会刷新整个应用而不是只重载当前组件；组件卸载时也只移除了 resize 监听，没有销毁 ECharts 实例，路由切换或反复进入边界页时存在 canvas 资源残留风险。
- 修复：为 `DynastyBoundaryMap` 增加 `reloadKey`，错误态重试只重新加载边界数据并清空旧 `boundaryData`；组件卸载时调用 `chartInstance.current?.dispose()` 并置空引用。边界文件加载失败日志同步改为中文。
- 验证：按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

### 59. 启动后数据页空白的公共加载与代理链路不稳

- 轮次：浏览器联调 / 启动后无数据排查
- 模块：前端 Vite dev proxy、API 连接检测、公共集合加载 hook
- 问题：`frontend/.env` 的 `VITE_API_BASE_URL` 含 `/api/v1`，Vite proxy 直接把该值作为 `target` 会把相对 `/api/v1/...` 请求转发成 `/api/v1/api/v1/...`，导致代理模式和连接检测误报失败；`testFrontendProxy()` 复用了直连 `apiClient`，无法真正验证前端代理。公共 `useCollectionResource` 默认 `items` 一定是数组，一旦 store 或响应转换异常写入 `undefined/null`，页面会在 `items.length` 处崩溃到空白/错误边界。
- 修复：Vite proxy target 归一为 API origin，允许额外使用 `VITE_API_PROXY_TARGET` 覆盖；`testFrontendProxy()` 改为直接 fetch `/api/v1/health`；`useCollectionResource` 对 `items` 和 `load()` 返回值做数组兜底，避免异常数据形态拖垮人物、文化、神话等集合页。
- 验证：本轮按当前只读/受控环境仅做代码审查与启动现场证据回放；未运行 lint、type-check 或测试。

### 60. 分朝代人物转换器任意类型扩散且查询 DTO 缺字符串校验

- 轮次：阶段一模块推进
- 模块：figure/tang/song/yuan/ming/qing/sanguo 前端 service、后端 figure 公共查询 DTO
- 问题：唐、宋、元、明、清、三国前端转换器仍以 `any` 读取 API/JSON 原始数据，三国 `role/kingdom` 和明朝 `role` 还直接 cast 为合法枚举；未知后端值会绕过前端角色/阵营白名单，筛选、详情徽标和中文映射都可能出现非法值。后端 `FigureQueryDto.role/period/name` 与三国 `name` 仅声明可选，缺少字符串校验。
- 修复：新增 `person/common/figureTransform.ts`，统一以 `unknown` 输入收口字符串、数字、字符串数组、历史事件和评价；六个分朝代转换器改用白名单归一角色/阵营，未知值回落到 `other/其他`，年份读取保留 `0` 的有效语义；后端 figure 查询 DTO 为 `role/period/name` 补 `@IsString()`。
- 验证：按当前约束仅做静态搜索和代码审查；`rg` 确认六个分朝代转换器中不再存在 `any` 命中，未运行 lint、type-check 或测试。
