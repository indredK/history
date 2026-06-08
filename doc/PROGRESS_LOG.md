# 项目进度日志

## 2026-06-08 阶段零启动

- 阅读并核对 `README.md`、`CHANGELOG.md`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`。
- 发现 README/CHANGELOG 引用的 `doc/` 与 `SECURITY.md` 在当前工作树缺失；本次先创建阶段零要求的核心文档。
- 新增 `doc/ROADMAP.md`，基于 CHANGELOG 的 M1 记录和当前代码结构梳理 M2-M7 路线图。
- 新增 `doc/ARCHITECTURE_ISSUES.md`，记录后端/前端模块完成度、技术债、安全补强清单和文档不一致问题。
- 新增 `doc/MODULE_STATUS.md`，建立 dynasty/event/person/emperor/figure/religion/culture/mythology/map 等模块状态矩阵。
- 新增 `SECURITY.md` 基础安全政策，列出 helmet、throttler、JWT/AuthGuard、结构化日志、HTTPS/CORS 等待实现项。
- 当前验证方式为代码与文档静态检查；阶段零文档变更未运行 lint/type-check。

## 2026-06-08 阶段一：dynasty 模块

- 为 `backend/src/dynasty` 补齐 `POST /dynasties`、`PATCH /dynasties/:id`、`DELETE /dynasties/:id`，朝代模块后端从只读提升为基础 CRUD。
- 新增 `CreateDynastyDto` / `UpdateDynastyDto`，补齐名称、年份和可选字段校验；`DynastyDto` 移除 Prisma schema 中并不存在的 `name_en` / `color` 漂移字段。
- `DynastyService` 增加朝代重名校验、开始/结束年份区间校验，以及可选文本字段清空时写入 `null` 的规范化逻辑。
- 扩展 `dynasty.service.spec.ts`，补充 create/update/remove、冲突校验、年份校验与可选字段清空场景。
- 同步更新 `doc/ARCHITECTURE_ISSUES.md`、`doc/MODULE_STATUS.md`、`doc/ROADMAP.md` 和 `MODULE_AUDIT_FIXES.md`，记录 dynasty 模块已补 CRUD、前端当前仍为只读展示链路。
- 本轮按仓库要求继续采用静态代码审查，未运行测试、lint、开发服务器或浏览器验证。

## 2026-06-08 阶段一：event 模块多标签筛选

- 修复后端 `/events` 与 `/timeline` 的 `eventType` 筛选，将精确相等改为逗号分隔标签边界匹配，避免 `war` 漏掉 `war,civil_war` 等多标签事件。
- 同步放宽 `EventQueryDto` / `TimelineQueryDto` 的事件类型校验，使 `political_event`、`civil_war`、`coup_d'etat` 等真实种子标签可以通过。
- 前端时间轴/地图新增统一事件标签拆分与中文分类逻辑，地图事件筛选、事件详情徽标和事件卡片不再暴露英文事件类型代码。
- 更新 `event.service.spec.ts` 的多标签筛选期望，并同步更新 `MODULE_AUDIT_FIXES.md`、`doc/MODULE_STATUS.md` 和 `doc/ARCHITECTURE_ISSUES.md`。
- 本轮按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器验证。

## 2026-06-08 阶段一：event 模块 CRUD

- 为 `backend/src/event` 补齐 `POST /events`、`PATCH /events/:id`、`DELETE /events/:id`，事件模块后端从只读提升为基础 CRUD。
- 新增 `CreateEventDto` / `UpdateEventDto`，支持事件标题、年份、描述、逗号分隔 `eventType` 标签，以及 `participants / locations / sourceIds` 关联输入。
- `EventDto` 扩展为可返回参与人物、地点和来源详情；`findOne` 改为保留这些关联，不再只返回基础字段。
- `EventService` 增加标题非空、年份区间、重复关联、引用存在性校验，并在更新时支持清空可选字段与整组替换关联关系。
- 重写 `event.service.spec.ts`，补充详情关联、create/update/remove、引用校验和多标签筛选场景。
- 本轮按用户最新要求继续采用静态代码审查，未运行测试、lint、开发服务器或浏览器验证。

## 2026-06-08 浏览器联调：启动后页面无数据

- 短暂启动前端开发服务器并接管 Browser，确认 `5173` 前端本身可启动；根路径跳转 `/map` 后页面实际有 117 个事件和 canvas，但默认聚焦夏朝 `-2070`，现有疆域文件无对应边界，造成首屏“像是没数据”。
- 修复地图首屏默认聚焦，优先选中现有边界数据覆盖的秦朝；Browser 复查显示 `疆域时间：公元前221年`、`当前聚焦：秦朝`。
- 修复时间轴加载完成后的空事件首帧，管理态未初始化前直接使用请求事件数据；时间轴页外层允许滚动，避免图表和事件管理面板在窄宽布局下被裁切；Browser 复查 `/timeline` 显示 `窗口内 117 / 共 117 个事件`，事件管理面板渲染 80 条列表截断结果。
- 事件前端补齐基础管理面板，接入 `createEvent` / `updateEvent` / `deleteEvent`，支持搜索、详情、创建、编辑、删除，mock/json 与 API 模式均有服务入口。
- ECharts 时间轴延迟到容器宽高有效后初始化，减少启动/热更新时 0 宽高导致的空画布 warning。
- 收紧 `useCollectionResource` 卸载收尾，避免旧实例写回共享 loading；神话 mock 写入入口增加空值防护。
- 本轮按用户最新要求做了前端开发服务器和 Browser 验证；未运行 lint、type-check 或测试。

## 2026-06-08 阶段一：event 模块关联编辑收尾

- 复查事件管理面板与后端更新契约，确认后端只要收到 `participants`、`locations`、`sourceIds` 字段就会整组替换对应关联。
- 修复前端事件表单入参构造：新增事件空关系不提交字段；编辑原本无关系的事件时空文本域不触发后端清空；编辑原本已有关系的事件时仍允许通过清空文本显式清空该组关联。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 41。
- 本轮按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

## 2026-06-08 阶段一：person 模块保存契约

- 复查 `backend/src/person` 与人物档案前端，确认 CRUD 已存在，公共 `PeopleFilter` 选中态已通过 `renderValue` 回显中文标签。
- 补齐人物保存业务校验：后端 service 拒绝“卒年早于生年”和超出 0-1 的可信度；前端人物档案弹窗在 mock/API 前也做同样校验，并在弹窗内展示中文错误。
- 同步修复 `person.service.spec.ts`，将旧的 `prisma.person.findMany/findUnique` mock 改为当前 `prisma.client.$queryRaw/$executeRaw` 路径，覆盖 JSON 字段解析、详情、异常和清空语义。
- 修复人物可信度空值展示，避免 mock 模式下 `null` 被详情页显示成 `0%`；`CommonPersonSchema` 同步允许接口类型中的 nullable 字段。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 44。
- 本轮按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

## 2026-06-08 阶段一：emperor 模块只读契约

- 复查 `backend/src/emperor`、人物页帝王 tab 和 `frontend/src/services/person/emperors`，确认 emperor 模块当前定位仍是只读列表/详情。
- 修复前端静态帝王服务：从 `persons.json` 转换时按 `roles=emperor` 过滤，补齐刘邦、李世民、忽必烈、朱元璋、康熙帝、乾隆帝等映射，避免非帝王人物混入帝王列表。
- 修复前端 API 契约归一化：保留 `reignEnd: null` 的未知语义，详情页不再显示伪造在位年数；兼容后端 `historicalEvaluation.summary/positives/negatives/impact` 结构。
- 修复后端查询 DTO 与 spec 漂移：`name` / `dynastyName` 补字符串校验，service spec 改为验证当前 `dynasty` / `dynastyName` 展示字段。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 47。
- 本轮按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

## 2026-06-08 阶段一：religion 模块图谱契约

- 复查 `backend/src/religion`、`frontend/src/services/religion` 和神话页宗教关系图，确认后端主图接口 `/religion/graph` 与前端兼容入口并存。
- 修复前端宗教图 API 入口：API 模式直接读取 `/religion/graph`，mock 模式读取 `religions.json`，保留 `getAll()` 兼容数组返回，避免 `/religions` 双层 `data` 包装导致转换为空图。
- 收紧宗教后端契约：兼容详情接口移除 `any`，返回 `ReligionNodeDto | null`；`period` 查询补字符串校验。
- 修复前端搜索高亮与筛选不一致，描述字段命中时也会加入高亮集合。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 49。
- 本轮按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

## 2026-06-08 阶段一：culture 模块保存与详情契约

- 复查 `backend/src/culture`、文化页、学派/学者 store 与 service，确认 schools/scholars 均已具备基础 CRUD，但保存契约和弹窗错误态仍有缺口。
- 后端 culture service 增加空名称与学者生卒年业务校验，更新学者时合并当前记录后再判断年份；DTO 补齐名称非空、数字转换和字符串数组元素校验。
- 前端文化编辑弹窗增加本地校验和弹窗内中文错误提示；页面保存/删除异常统一为中文兜底，并在打开/关闭弹窗、删除确认时清理旧错误。
- 修复文化详情展示：学者年份不再用 truthy 判断，支持 `0` 年和单端未知；学派详情只渲染有内容的分节，创立年份改为中文公元/公元前格式。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 51；`doc/MODULE_STATUS.md` 与 `doc/ARCHITECTURE_ISSUES.md` 已记录文化模块状态。
- 本轮按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

## 2026-06-08 阶段一：mythology 模块保存分类契约

- 复查 `backend/src/mythology`、神话页、神话表单和 `frontend/src/services/mythology`，确认神话 CRUD 已存在，但保存校验和分类契约仍需收紧。
- 后端 `CreateMythologyDto` 增加标题、分类、描述中文校验消息和分类白名单；`MythologyService` 写入时拒绝空标题、空描述、非法分类，并将 legacy 分类别名归一为中文分类展示。
- 更新 `mythology.service.spec.ts`，将旧 `creation` 分类期望对齐为“创世神话”，并补创建/更新保存校验期望。
- 前端神话表单将保存错误提升到弹窗顶部 Alert；关闭表单或删除确认时清理旧 mutation error，避免错误串到下一次操作。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 52；`doc/MODULE_STATUS.md` 与 `doc/ARCHITECTURE_ISSUES.md` 已记录神话模块状态。
- 本轮按用户最新要求仅做静态代码审查，未运行测试、lint、开发服务器或浏览器。

## 2026-06-08 浏览器复核：地图启动页无事件点

- 接管 Browser 读取当前页和控制台，确认当前 `/timeline` 有 117 条事件；历史控制台中 `/map` 曾出现 `未找到年份 -2070 对应的边界数据`，Browser reload 后续被安全策略拦截，未绕过。
- 静态核算地图启动链路：根路径默认进入 `/map`，事件/朝代/地点 JSON 均存在；但旧首屏会落到有边界却无事件的秦朝，且静态事件缺少 `rawLocations/mapLocationHints`，导致事件点解析为 0。
- 保留 `EChartsMapView` 首屏默认秦朝边界，避免回到无边界的夏朝；地图工作台默认开启“显示全部事件”，避免当前疆域事件数为 0 时首屏没有事件点。
- 修复 `resolveEventLocations`，当静态事件没有显式地点字段时，从标题、描述、参与者文本中匹配地点库主名/别名作为兜底事件点；静态核算可得到 37 个有地点事件、43 个事件点。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 53；本轮未运行测试、lint 或开发服务器。

## 2026-06-08 阶段一：map 模块接口与前端兜底

- 复查 `backend/src/map` 与前端地图工作台、边界图层、地图数据服务，按用户最新要求仅做代码静态审查，不运行测试、lint、开发服务器或 Browser。
- 后端补齐地图接口契约：新增边界 period/year 查询 DTO，`/map/boundary-data` 具备空值、大小写归一和白名单校验；`/places` 接入已有 `PlaceQueryDto`，支持 keyword、经纬度范围过滤，反向范围自动归一。
- map/places controller 补齐 Swagger tags、operation、response；`main.ts` 同步注册 `Places` 与 `Map` 标签。
- 前后端地图预加载策略同步加入秦/汉边界，贴合首屏默认秦朝边界，避免首屏常用边界不进缓存。
- 前端地图工作台年份过滤改为安全解析并归一化开始/结束年份；`EChartsMap` 与 `DynastyBoundaryMap` tooltip 转义动态文本；朝代疆域组件改用统一边界路径常量，适配非根路径部署。
- 地图 service 转换器改为 `unknown` 输入并显式收口地点 id、名称、坐标和来源字段；地图数据缓存从 `any` 改为 `unknown` 泛型出口，减少 map 模块类型债。
- 地图工作台补齐窄屏响应式布局：1024px 以下改为纵向可滚动页面流，筛选面板、地图舞台、状态条/工具栏和时间轴不再依赖互相覆盖的绝对定位；640px 以下筛选控件单列显示。
- 朝代疆域图错误态重试改为组件内 reload，不再刷新整个应用；组件卸载时销毁 ECharts 实例，减少路由切换后的 canvas 资源残留。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 58；`doc/MODULE_STATUS.md` 与 `doc/ARCHITECTURE_ISSUES.md` 已记录 map 模块契约和剩余测试缺口。

## 2026-06-08 浏览器联调：启动后空数据公共链路

- 接管 Browser 的启动现场显示：根路径会跳转 `/map`，地图页本身已有 117 条事件和秦朝边界；“页面没有数据”的风险集中在公共加载链路、代理配置和开发热更新报错，而不是后端全局无数据。
- 修复 Vite proxy target：从 `VITE_API_BASE_URL=http://localhost:3001/api/v1` 中提取 origin，避免相对 `/api/v1/...` 被代理成 `/api/v1/api/v1/...`；保留 `VITE_API_PROXY_TARGET` 供独立覆盖。
- 修复 `testFrontendProxy()`，改为真正请求前端相对 `/api/v1/health`，不再复用直连 `apiClient` 导致“代理测试”和“直连测试”结果相同。
- 收紧公共 `useCollectionResource`：`items` 和 `load()` 返回值增加数组兜底，避免人物、文化、神话等集合页在异常数据形态下因 `items.length` 崩溃为空白页。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 59；当前环境切为受控只读，未运行 lint、type-check、测试或再次启动开发服务器。

## 2026-06-08 阶段一：figure 分朝代类型收口

- 复查 `backend/src/figure` 与 `frontend/src/services/person/{tang,song,yuan,ming,qing,sanguo}`，确认六个分朝代人物模块当前定位仍是只读列表/详情，前端 tabs 和详情组件具备基础展示能力。
- 后端 `FigureQueryDto` 为 `role`、`period`、`name` 补字符串校验，三国查询 `name` 同步补校验，避免裸 query 值进入 service 过滤。
- 新增 `frontend/src/services/person/common/figureTransform.ts`，统一收口原始 API/JSON 数据的字符串、数字、字符串数组、事件和评价读取。
- 唐、宋、元、明、清、三国转换器从 `any` 改为 `unknown` 输入；角色/阵营统一白名单归一，未知值回落到 `other/其他`，避免非法枚举污染筛选和详情中文映射。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 60；按当前约束仅做静态搜索和代码审查，未运行 lint、type-check、测试或开发服务器。

## 2026-06-08 浏览器联调：真实 API 数据库启动链路

- 接管 Browser 逐页复查真实路由：`/map` 显示 117 个事件与秦朝边界，`/people`、`/mythology`、`/culture`、`/dynasties`、`/timeline`、`/dynasty-boundaries` 均能渲染数据；`/emperors-cyber` 有 630 条帝王年表记录，只有当前详情纪事为空态。
- 提权接口探测确认前端代理 `/api/v1/health` 和后端直连 `/api/v1/health` 均为 200；`events` 返回 283 条，`dynasties` 返回 39 条，但 `persons`、`scholars`、`schools` 返回 500。
- 定位根因：后端默认数据库路径曾回落到 `file:./dev.db`，与 README/Prisma seed 流程的 `backend/prisma/dev.db` 不一致；本地 SQLite 的 `persons` 表仍是旧 7 列结构，缺少扩展人物档案列，导致真实 API 模式人物/文化基础列表启动后失败。
- 修复 Prisma 默认路径为 `file:./prisma/dev.db`，并让 `scripts/dev.sh` 启动前自动执行 `db:migrate` 与幂等 `db:seed`；README 同步修正 seed 命令和 API 空数据恢复步骤。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 61；本轮按用户要求接管 Browser 和本地接口验证，未运行 lint、type-check 或测试。

## 2026-06-08 阶段一：people 分朝代公共组件收尾

- 继续复查人物页公共 figure 组件和唐/宋/元/明/三国 tab，确认 `PeopleFilter` 选中态中文回显仍有效，问题集中在详情年份、三国卡片标签和集合 hook 类型。
- 公共详情弹窗新增安全年份格式化：缺失年份不再显示 `0年`，负数年份显示为“公元前 N 年”，享年只在生卒年都可靠且顺序合法时展示。
- 分朝代 service helper 同步安全化列表卡片寿命格式，并将未知出生年排序到后面，避免卡片和详情语义分裂。
- 三国人物卡片二级标签统一使用 `曹魏/蜀汉/东吴`，与筛选下拉和详情弹窗一致。
- `useFigureCollection` 增加泛型 store 契约，唐/宋/元/明/三国/清/帝王 tab 传入各自排序枚举，移除公共 hook 的 `any`。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 62；本轮按当前约束仅做静态搜索和代码审查，未运行 lint、type-check、测试、开发服务器或浏览器。

## 2026-06-08 阶段一：qing 统治者时间显示收尾

- 继续复查清朝统治者 tab，发现 `reignStart/reignEnd` 缺失时会被前端转换器兜底为 `0`，service 与 UI 又直接格式化和相减。
- 修复清朝统治者在位时间格式化：未知年份显示为“在位时间不详 / 起始不详 / 结束不详”，可靠年数才显示“共 N 年”和“在位 N 年” chip。
- 清朝时期判断支持空值回落“其他”，按在位时间排序时未知年份后置，避免筛选/排序把兜底 `0` 当真实历史年份。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 63；本轮按当前约束仅做静态代码审查，未运行 lint、type-check、测试、开发服务器或浏览器。

## 2026-06-08 阶段一：person archive 年份显示

- 复查人物档案 archive 卡片、详情和表单，确认性别选择框选中态已有中文 `renderValue`，继续收敛年份展示问题。
- 修复人物档案生卒年格式：缺失年份显示“生卒不详 / 生年不详 / 卒年不详”，公元前年份显示为“公元前 N 年”，不再露出 `?` 或负数裸值。
- 人物详情相关事件年份复用同一中文纪年格式，避免公元前事件显示成 `-551年`。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 64；本轮按当前约束仅做静态代码审查，未运行 lint、type-check、测试、开发服务器或浏览器。

## 2026-06-08 阶段一：emperor 在位起始年兜底

- 继续复查人物页帝王 tab，发现转换器缺失 `reignStart` 时会兜底为 `0`，service 排序和年数计算会把它当真实年份。
- 帝王类型允许 `reignStart: null`，API/静态转换器保留未知起始年；service 在位时间格式、排序和年数计算统一做可靠性判断。
- 帝王详情年号年份改为“公元前 N 年 / N 年 / 未知”，与人物档案和分朝代人物详情保持一致。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 65；本轮按当前约束仅做静态代码审查，未运行 lint、type-check、测试、开发服务器或浏览器。

## 2026-06-08 阶段一：culture 学者年份和转换器收口

- 继续复查人物页文化名人与文化页学者卡片/详情，确认问题集中在学者生卒年中文纪年、未知年份排序和 API/JSON 转换字段兼容。
- 新增 `scholarYearFormat`，学者卡片和详情统一显示“公元前 N 年 / N 年 / 生年不详 / 卒年不详”，两端未知时不渲染寿命标签。
- 学者按出生年排序时将未知年份后置；`scholarApi` 改为 `unknown` 输入，兼容 camelCase 与 snake_case 字段，过滤无效日期并让 achievements 在空值时回退 contributions。
- 同步更新 `MODULE_AUDIT_FIXES.md`，已修复问题计数推进到 66；本轮按当前约束仅做静态搜索和代码审查，未运行 lint、type-check、测试、开发服务器或浏览器。
