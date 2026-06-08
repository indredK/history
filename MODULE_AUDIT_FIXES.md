# 模块审查与修复记录

> 任务要求：按模块逐一检查页面、后端业务逻辑、公共组件、国际化和响应式；第一轮修复后进行第二轮更严格复查。每修复一个问题同步记录。

## 进度

- 第一轮：已完成
- 第二轮：已完成
- 已修复问题计数：33

## 复扫结论

- 第二轮已按更严格标准复查页面模块、后端接口契约、公共组件、选择框选中态、中文错误态、分页全量加载、详情路由、可选字段清空、响应式入口和 API 响应文案。
- 剩余英文命中主要集中在 Swagger 描述、控制台开发日志、测试场景文本和技术标识（如 API / ID），未发现新的用户界面文案或业务响应 message 阻断项。
- 模块复扫阶段按仓库要求未运行测试、lint、开发服务或浏览器验证；对应结论来自代码审查和静态搜索。

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
