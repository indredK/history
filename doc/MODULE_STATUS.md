# 模块状态矩阵

> 生成日期: 2026-06-08
> 说明: “测试覆盖”仅统计当前工作树可验证文件；CHANGELOG 记录但当前缺失的前端测试不计入已覆盖。

| 模块 | 后端 API | 前端 UI | 测试覆盖 | 文档 | 优先级 |
|------|----------|---------|----------|------|--------|
| dynasty | CRUD: `GET/POST/PATCH/DELETE /dynasties`，含重名/年份校验 | 朝代表、虚拟表格、甘特图、边界页入口；当前仍无前端新增/编辑入口 | 后端 service spec 已补读写覆盖；前端测试缺失 | 本矩阵已记录；需补朝代字段契约与前端只读说明 | P0 |
| event | CRUD + 时间轴: `GET/POST/PATCH/DELETE /events`, `GET /events/:id`, `GET /timeline`；多标签 `eventType` 筛选已按边界匹配，详情含人物/地点/来源关联 | 时间轴页、地图事件筛选、事件卡片、事件管理面板；事件类型已统一中文分类显示，编辑关系字段已避免空值误替换 | 后端 service spec 已补详情关联、create/update/remove 与多标签筛选期望；前端测试缺失 | 多标签、关联详情、前端管理入口和关系编辑保护已记录；仍需补字段格式说明 | P0 |
| person | `GET/POST/PATCH/DELETE /persons` CRUD；service 已补生卒年与可信度保存校验；开发启动前会自动迁移/seed，避免旧 SQLite 缺扩展人物列导致列表 500 | 人物档案列表/筛选/详情/新增/编辑/删除；表单弹窗内已有中文保存错误提示，公共筛选选中态中文回显可用，可信度空值不再误显示 0%，生卒年和相关事件年份已用中文历史纪年 | 后端 service spec 已对齐当前 `$queryRaw/$executeRaw` 实现；前端测试缺失 | 已记录保存契约、nullable 字段契约、测试 mock 对齐、年份显示和数据库启动链路；仍需补人物字段与来源说明 | P0 |
| emperor | 列表/详情: `GET /emperors`, `GET /emperors/:id`; 无写接口；查询 DTO 已补姓名/朝代字符串校验 | 人物页帝王 tab、赛博帝王页；帝王 service 已过滤静态非帝王人物，保留未知起止在位年份语义并兼容历史评价结构；详情年号年份已用中文历史纪年 | 后端 service spec 已对齐 `dynasty` / `dynastyName` 展示契约；前端测试缺失 | 已记录只读契约、静态映射、nullable 在位起止与评价结构；仍需补帝王数据源说明 | P1 |
| figure/common | 抽象 service/DTO，无独立路由；公共查询 `role/period/name` 已补字符串校验 | DynastyFigureCard、BaseFigureDetailModal 等公共人物组件；分朝代转换共用 `figureTransform` 收口原始数据；详情/卡片年份已安全显示，公共集合 hook 已移除 `any` 并约束排序枚举 | 后端 base service spec 有；前端测试缺失 | 已记录公共查询校验、转换器收口、年份显示和 hook 类型收口；仍需补公共字段规范 | P1 |
| tang | `GET /figures/tang`, `GET /tang-figures`, `GET /tang-figures/:id`; 只读 | 人物页唐朝人物 tab、详情；转换器已用 `unknown` 输入和角色白名单；详情寿命标签已避免缺失年份显示 `0年` | 后端 service spec 有；前端测试缺失 | 已记录角色归一和年份显示；仍需补时期字段契约 | P1 |
| song | `GET /figures/song`, `GET /song-figures`, `GET /song-figures/:id`; 只读 | 人物页宋朝人物 tab、详情；转换器已用 `unknown` 输入和角色白名单；详情寿命标签已安全化 | 后端 service spec 有；前端测试缺失 | 已记录角色归一和年份显示；仍需补时期字段契约 | P1 |
| yuan | `GET /figures/yuan`, `GET /yuan-figures`, `GET /yuan-figures/:id`; 只读 | 人物页元朝人物 tab、详情；转换器已用 `unknown` 输入和角色白名单；详情寿命标签已安全化 | 后端 service spec 有；前端测试缺失 | 已记录类型收口和年份显示；仍需补 period 当前后端不生效的契约说明 | P1 |
| ming | `GET /figures/ming`, `GET /ming-figures`, `GET /ming-figures/:id`; 只读 | 人物页明朝人物 tab、详情；转换器已用 `unknown` 输入和角色白名单；详情寿命标签已安全化 | 后端 service spec 有；前端测试缺失 | 已记录角色归一和年份显示；仍需补时期字段契约 | P1 |
| qing | `GET /figures/qing`, `GET /qing-rulers`, `GET /qing-rulers/:id`; 只读 | 人物页清朝人物 tab、详情；转换器已用 `unknown` 输入并收口政策/事件/评价；在位时间缺失时不再显示 `0年` 或 `在位0年`，未知年份排序后置 | 后端 service spec 有；前端测试缺失 | 已记录统治者转换收口、在位时间显示和排序兜底；仍需补统治时期与排序契约 | P1 |
| sanguo | `GET /figures/sanguo`, `GET /sanguo-figures`, `GET /sanguo-figures/:id`; 只读；三国查询 `name` 已补字符串校验 | 人物页三国人物 tab、详情；转换器已用 `unknown` 输入，role/kingdom 未知值回落到 `other/其他`；卡片、筛选和详情的势力标签已统一为完整中文名 | 后端 service spec 有；前端测试缺失 | 已记录 kingdom/role 归一、中文标签和年份显示；仍需补完整字段契约 | P1 |
| religion | `GET /religion/graph`, `GET /religions`, `GET /religions/:id`; 只读；`period` 查询已补字符串校验，兼容详情返回 `ReligionNodeDto | null` | 神话页宗教关系图、搜索、筛选、节点面板；前端 API 模式直连主图接口，搜索高亮与描述筛选一致 | 后端 service spec 有；前端测试缺失 | 已记录主图接口、兼容接口和高亮契约；仍需补图谱节点/边字段说明 | P1 |
| culture | scholars 与 schools 均有 `GET/POST/PUT/DELETE`；已补空名称、生卒年保存校验和 DTO 数字/数组约束；开发启动前会自动迁移/seed，避免旧 SQLite 缺文化扩展列导致列表 500 | 文化页学派/学者 tabs、详情、表单；弹窗内已有中文保存错误提示，详情空字段和学者历史年份展示已收敛，未知出生年排序后置 | 后端 service spec 已补保存校验期望；前端测试缺失 | 已记录保存契约、详情展示修复、学者转换器字段收口和数据库启动链路；仍需补学者-学派关联规则 | P1 |
| mythology | `GET/POST/PATCH/DELETE /mythologies` CRUD；已补标题/分类/描述保存校验和中文分类归一 | 神话故事列表、分类、搜索、详情、新增/编辑/删除；表单保存错误已在弹窗顶部提示，关闭弹窗会清理旧错误 | 后端 service spec 已补保存校验与中文分类期望；前端测试缺失 | 已记录保存分类契约；仍需补 API/JSON 字段映射说明 | P1 |
| map | `GET /places` 支持 keyword/经纬度范围过滤；boundary/cache/preload 只读接口含 period/year 校验与 Swagger；预加载覆盖秦/汉/唐/宋/明/清 | 地图工作台、边界图层、播放控件；首屏默认聚焦秦朝边界并默认显示全部事件点，静态事件缺少地点字段时可用标题/描述匹配地点库兜底显示事件点；年份筛选和 tooltip 已补安全兜底；地点转换器已收口 `unknown` 输入；窄屏布局改为纵向可滚动；朝代疆域图支持组件内重试并释放 ECharts 实例 | 当前未发现 map service spec；前端测试缺失 | 已记录默认聚焦、全部事件点、地点兜底、边界查询契约、前端 tooltip/路径兜底、map service 类型收口、响应式修复和图表资源释放；仍需补后端部署路径说明与自动化测试 | P1 |
| timeline UI | 后端归入 event/timeline | 独立时间轴页、EChartsTimeline、事件详情、事件管理面板 | 前端测试缺失 | 需补事件管理字段格式、交互和聚合说明 | P1 |
| emperors-cyber | 后端归入 emperor | 赛博帝王页、3D 背景、移动选择控件 | 前端测试缺失 | 需补与 emperor API 的数据关系 | P2 |
| common/backend | health、response DTO、pagination、logging、exception；Prisma 默认数据库路径与 dev 启动迁移/seed 已统一 | 不适用 | 后端 common spec 有 | 需补安全/日志规范和数据库初始化说明 | P1 |
| common/frontend | 不适用 | FixedTabsPage、CommonTabs、StateView、ContentCard、FigureGrid、ErrorBoundary；`useCollectionResource` 已补异常非数组兜底，Vite dev proxy 与代理检测已避免 `/api/v1` 重复拼接；人物/文化转换器已开始复用 `figureTransform` 收口原始字段 | 前端测试缺失 | 需补组件使用规范、代理配置说明、转换器字段契约和公共 hook 测试 | P1 |

## 状态图例

- “列表/详情”表示至少有读接口，但不代表写操作完整。
- “CRUD”表示当前 controller 已暴露创建、更新、删除，但仍需检查 DTO 校验、错误语义和前端表单一致性。
- “前端测试缺失”表示 `frontend/src` 当前未发现 `*.test.ts` / `*.test.tsx`。
- 优先级按下一阶段推进顺序和风险排序，P0 为当前应立即推进。

## 下一次更新规则

每完成一个模块推进，至少更新:

1. 后端 API: 新增/删除/修改接口、DTO、Swagger 和错误语义。
2. 前端 UI: 列表/详情/筛选/搜索/交互/响应式/空态。
3. 测试覆盖: 后端 Jest 与前端 Vitest 文件名。
4. 文档: 对应字段契约、数据来源、已知限制。
