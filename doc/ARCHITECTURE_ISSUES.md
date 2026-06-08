# 架构问题与技术债清单

> 生成日期: 2026-06-08
> 状态口径: 以当前工作树可验证文件为准，CHANGELOG 记录但当前缺失的内容标为“需校准”。

## 总览

当前项目已经具备 NestJS 后端、React 地图优先前端、Prisma seed-data、后端 service 测试和 GitHub Actions 基线。主要问题集中在四类:

1. 文档与仓库状态不一致: README/CHANGELOG 曾引用缺失的 `doc/` 与 `SECURITY.md`，本轮已补基础文档；CHANGELOG 记录的前端测试在当前工作树仍未检出。
2. API 写能力不均衡: person/culture/mythology/dynasty/event 已有 CRUD，emperor/figure/religion/map 多为只读。
3. 前端 feature 完成度不均: 地图、时间轴、人物、神话、文化可用；部分模块仍缺少测试、表单校验、响应式细节和性能约束。
4. 安全与可观测性尚未产品化: Swagger 预留 JWT，但 throttler、helmet、认证守卫、结构化日志、SECURITY.md 均未落地。

## 后端模块完成度

| 模块 | 当前完成度 | 缺失功能 / 风险 |
|---|---|---|
| common | 响应 DTO、分页 DTO、日志拦截器、异常过滤器均有 spec；日志拦截器返回类型已从显式 `any` 收口为 `unknown` | 日志仍是 Nest Logger 文本日志，缺少 pino/trace id；未统一请求限流与安全头 |
| dynasty | `GET/POST/PATCH/DELETE /dynasties`，service spec 已补读写覆盖；写入和查询年份已拒绝公元 0 年 | 前端仍未接入新增/编辑入口；朝代与边界/帝王/事件关联未形成统一聚合 API |
| event | `GET/POST/PATCH/DELETE /events`、`GET /events/:id`、`GET /timeline`，多标签 `eventType` 筛选已校准，详情已返回人物/地点/来源关系，service spec 已补对应期望；写入和查询年份已拒绝公元 0 年，空时间线 bounds 不再回落 `0/0` | 前端事件管理字段格式、来源说明和年份校验仍需补齐自动化测试 |
| person | `GET/POST/PATCH/DELETE /persons`，service spec 存在；写入和查询年份已拒绝公元 0 年；开发启动链路已统一 Prisma 默认 DB 路径并自动迁移/seed，避免旧 SQLite 缺人物扩展列导致 500；前端人物档案年份显示已统一中文历史纪年 | 需要确认 source/person 关联写入、重复姓名处理、软删除/审计字段 |
| emperor | `GET /emperors`、`GET /emperors/:id`，service spec 存在；查询年份已拒绝公元 0 年；前端帝王转换器已保留未知在位起始年，避免 `0年` 假数据 | 无写接口；与 dynasty/reign/eraName 的聚合和赛博帝王页数据源需统一 |
| figure/tang/song/yuan/ming/qing/sanguo | 每朝提供 legacy 和 canonical 列表、详情，service spec 存在；公共查询已补字符串校验并拒绝公元 0 年，前端分朝代转换器已用 `unknown` 收口并白名单归一角色/阵营；前端详情/卡片年份显示已避免 `0年` 假数据，三国势力标签已统一中文长名；清朝统治者在位时间缺失显示和排序已兜底 | 只读；DTO 与各朝字段差异较多，新增朝代容易重复；时期字段、Yuan/Qing period 后端不生效等契约仍需文档化 |
| religion | `GET /religion/graph`、`GET /religions`、`GET /religions/:id`，service spec 存在 | 无节点/边 CRUD；大图查询缺少分页、缓存、布局预计算和权限控制 |
| culture | scholars 与 schools 均有 CRUD，service spec 存在；保存校验已覆盖空名称、学者生卒年和学派创立年，写入/查询年份已拒绝公元 0 年；开发启动链路已避免旧 SQLite 缺文化扩展列导致列表 500；前端学派/学者转换器已兼容 camelCase/snake_case 并收口未知年份与数组结构语义，学派创立年份 0 不再显示假“公元元年”；学者作品转换器语法错误已修复，文化页动态导入恢复 | scholar-school 双字段同步仍需跨 API/前端测试；PUT/PATCH 语义需统一 |
| mythology | `GET/POST/PATCH/DELETE /mythologies`，service spec 存在；保存校验已覆盖标题、分类和描述 | JSON/mock/API 字段映射仍需文档化；前端自动化测试缺失 |
| map | places 与 boundary/cache 只读接口已有；地点查询支持 keyword/经纬度范围，边界 period/year 已补 DTO 校验和 Swagger，year 已拒绝公元 0 年；预加载覆盖首屏秦/汉边界 | 无 map service spec；边界文件读取仍依赖前端 public 资源路径，后端独立部署时路径策略需固定 |

## 前端模块完成度

| 模块 | 当前完成度 | UI/UX 待优化项 |
|---|---|---|
| map | 首页工作台可显示事件、边界时间、播放控件；首屏默认聚焦已避开无边界数据年份，并默认显示全部可解析事件点；静态事件缺地点字段时已用标题/描述兜底匹配地点库；年份筛选、事件详情年份、tooltip 转义、边界资源路径、地点转换器类型收口、嵌入时间线初始范围、窄屏布局和朝代疆域图组件内重试已补基础兜底 | 边界年份缺失仍需更友好的手动切换空态；MapLibre/Deck.gl/ECharts 性能需压测；地图前端测试仍缺失 |
| timeline | ECharts 时间轴显示 117 个事件，支持重置视图和事件管理面板；事件分享 payload、D3 轴、hover 元素和配置参数已补具体类型；卡片、详情、管理面板、D3 标签和 3D 朝代卡片年份已统一中文历史纪年；事件管理表单已本地提示 0 年和反向年份 | 大跨度聚合、事件管理字段格式、筛选与地图联动仍需测试和可访问性复查 |
| dynasties | 朝代表、虚拟表格、甘特图组件存在；甘特图过滤 0 年/反向区间，空数据 bounds 不再回落 `[0, 1]` | 移动端表格密度、搜索/筛选、边界页与朝代页导航一致性待优化 |
| people | 固定 tabs 覆盖档案、帝王、文化名人、唐宋元明清三国；档案 CRUD 可用；档案/分朝代/文化名人详情年份、三国势力标签、文化名人筛选旧值兜底、移动端 tabs 滚动按钮、人物表单 0 年提示和公共集合 hook 类型已收口 | 需补前端 Vitest；筛选枚举中文化仍需在第二轮严格复扫中覆盖更多边界态 |
| emperors-cyber | 有赛博风格帝王页、3D 背景、移动选择控件 | 数据来源与 emperor API 未统一；0 条纪事等空态需要与真实事件关联 |
| culture | 学派/学者列表、详情、表单已有；编辑弹窗已补基础校验、0 年提示和中文错误态；学者卡片/详情已使用中文历史纪年并隐藏两端未知寿命标签；学者筛选器已兼容旧筛选值并保持选中态可见；学派卡片/详情数据转换已收口代表人物、经典著作和核心思想字段，详情创立年份已避免 0 年假显示；浏览器复查文化页已能渲染学派数据 | 关联学者更新、卡片密度、移动端操作区和前端自动化测试仍需补齐 |
| mythology | 神话故事/宗教关系 tabs、分类统计、CRUD 表单、关系图已有；表单错误反馈已移入弹窗顶部；URL 直达宗教 tab 时公共 tabs 会同步外层 `religion-view` 状态；宗教图谱 D3 布局已补节点/边 datum 类型 | 图谱大数据布局性能、搜索框 a11y、分类空态和前端自动化测试需补齐 |
| common UI | FixedTabsPage、CommonTabs、StateView、ContentCard、FigureGrid 等可复用；公共集合加载 hook 已补非数组兜底，Vite dev proxy 已避免 `/api/v1` 重复拼接；FixedTabsPage 已统一 URL/default/click activeTab 通知；人物页大量 tabs 已开启移动端滚动按钮；路由表、公共数据加载、API 降级配置、storage 监听器、数据源指示器、错误边界、响应式表格和响应式 hook 不再使用显式 `any` | 公共组件缺少前端测试；MUI v9 slotProps 迁移需全量扫描；代理配置、数据源模式、公共响应解析契约和可视化交互测试需补文档 |

## 技术债清单

| 类型 | 问题 | 影响 | 优先级 |
|---|---|---|---:|
| 文档债 | `doc/` 与 `SECURITY.md` 原先缺失，本轮已补；`doc/DEPLOY.md` 仍缺失 | 新贡献者按 README 的部署指南仍会 404 | P0 |
| 测试债 | 当前 `frontend/src` 未发现 `*.test.*`，与 CHANGELOG 记录不一致 | 前端回归无法自动证明 | P0 |
| 类型债 | `.github/workflows` 注释记录 frontend no-explicit-any、backend no-unsafe 历史问题；map service、people/culture 相关转换器、后端公共日志拦截器、前端路由表、公共数据加载、API 降级配置、storage 监听器、人物公共集合 hook、公共 UI、宗教图谱和时间线渲染器已收口本轮发现的显式 `any`；当前静态搜索确认 `frontend/src` 已无显式 `any` 命中，后端业务源码排除 Prisma generated/测试断言后无 `any` 命中；本轮收尾补齐严格可选属性、索引访问和 D3 datum 类型问题 | 已按用户要求补跑 lint/type-check，最终结果记录在进度日志 | P1 |
| 代码重复 | 六个朝代 figure service/controller/DTO 同形但分散 | 新增字段/枚举容易漏改 | P1 |
| 数据源重复 | API、JSON、mock 转换器多处各写一套；已修复 dev proxy target 与代理检测误用直连客户端的问题 | 字段映射、空值语义和环境变量说明仍易不一致 | P1 |
| 数据库启动漂移 | 后端默认 DB 路径曾与 README/seed 流程不一致，旧 SQLite 表结构会让 `persons/scholars/schools` 500；现已统一默认 `file:./prisma/dev.db` 并在 dev 启动前迁移/seed | 仍需在部署文档中明确生产迁移和备份流程 | P1 |
| 性能债 | 地图边界、宗教图谱、时间轴大数据渲染缺少统一性能预算 | 大数据场景可能卡顿 | P1 |
| CI 债 | lint informational，缺少 build 和产物体积检查 | 质量 gate 不完整 | P2 |

## 安全补强清单

`SECURITY.md` 已在本轮补齐基础政策，以下作为 M6 安全目标的待实现清单:

| 项目 | 当前状态 | 目标 |
|---|---|---|
| SECURITY.md | 已补基础政策 | 后续补真实私密联系方式、披露流程负责人和版本支持策略 |
| Helmet | 未发现依赖/使用 | 后端 `main.ts` 接入 `helmet()`，生产配置 CSP/security headers |
| Throttler | 未发现 `@nestjs/throttler` | 对全局 API 和写接口加速率限制，登录/写操作使用更严格策略 |
| JWT/AuthGuard | Swagger 预留 `JWT-auth`，未发现实际 AuthGuard/JWT service | 引入 JWT 模块、认证守卫、角色/权限策略，明确公开接口白名单 |
| 结构化日志 | 使用 Nest Logger/LoggingInterceptor | 接入 pino 或等价结构化日志，含 request id、duration、status、user id |
| HTTPS/CORS | CORS 允许来源需审查 | 生产环境限制 origin，文档化 HTTPS 反代和安全 cookie 策略 |
| 输入校验 | DTO/class-validator 已部分存在 | 写接口全字段校验，数组/JSON 字段长度和枚举白名单统一 |
| 数据安全 | SQLite 本地开发友好 | 生产备份、迁移、seed-data 来源许可、敏感配置 `.env` 管理需要文档 |

## 文档状态问题

- README 的项目结构列出 `doc/ROADMAP.md`、`doc/ARCHITECTURE_ISSUES.md`、`doc/DEPLOY.md`；当前已补 `ROADMAP` 与 `ARCHITECTURE_ISSUES`，`DEPLOY.md` 仍属于阶段三。
- README 提到 `SECURITY.md`，本轮已补基础文件，但联系方式仍是建设中。
- CONTRIBUTING 的安装步骤仍写了进入 frontend/backend 单独 `bun install`，与 README 的 workspace 安装建议冲突，阶段三需校准。
- CHANGELOG 记录大量前端测试，但当前工作树未发现前端测试文件，需确认是否遗失、未迁入或 CHANGELOG 超前。

## 下一轮建议

1. 已从 `dynasty` 模块补齐一轮 Controller/Service/DTO/测试模板、公元 0 年拒绝和甘特空数据 bounds 兜底，并在 `event` 模块补齐多标签筛选、CRUD、关联详情、前端事件管理入口、公元 0 年拒绝、前端 0 年提示和时间线中文纪年；`person` 模块已补保存校验、0 年拒绝、表单错误态、前端 0 年提示、service spec mock 对齐、人物档案年份显示和开发数据库启动链路；`emperor` 模块已补静态帝王过滤、nullable 在位起止年份、0 年查询拒绝、历史评价归一化和查询 DTO/spec 漂移；分朝代 `figure` 模块已补公共查询字符串校验、0 年查询拒绝、前端转换器类型收口/枚举归一、详情/卡片年份显示、清朝统治者在位时间兜底和三国势力中文标签一致性；`religion` 模块已补主图 API 入口、兼容详情类型、period 校验、搜索高亮契约和图谱 D3 布局类型；`culture` 模块已补保存校验、0 年拒绝、前端 0 年提示、弹窗错误态、详情空值展示、学者历史年份格式、学派创立年份兜底、筛选旧值兜底和学派/学者转换器字段收口、开发数据库启动链路；`mythology` 模块已补保存分类契约、表单错误清理和宗教 tab URL 状态同步；`map` 模块已补首屏边界、事件点空态、边界查询契约、边界公元 0 年拒绝、地点查询过滤、预加载策略、事件详情年份、tooltip 转义、资源路径兜底、service 类型收口、嵌入时间线初始范围、窄屏布局和图表错误恢复；公共前端链路已修复 dev proxy `/api/v1` 重复拼接、代理检测误用直连客户端、集合加载非数组崩溃风险、人物集合 hook `any`、FixedTabsPage activeTab 通知、前端路由表显式 `any`、公共数据加载与 storage 显式 `any`、数据源指示器/错误边界/响应式表格/响应式 hook 显式 `any`、人物页移动端 tabs 滚动按钮；时间线渲染器显式 `any` 已收口；后端公共链路已收口日志拦截器显式 `any`，dev 启动前数据库迁移/seed 漂移也已修复；下一步继续补字段说明与前端测试。
2. 将 `SECURITY.md` 待办拆为可执行 issue，并优先落地 helmet、throttler、JWT/AuthGuard。
3. 恢复或重建前端 Vitest 基线，至少覆盖 `useCollectionResource`、people/mythology store、FixedTabsPage、关键 service 转换器。
