# 中国历史全视界开发路线图

> 生成日期: 2026-06-08
> 依据: `README.md`、`CHANGELOG.md`、`CONTRIBUTING.md`、当前 `backend/src`、`frontend/src/features`、`.github/workflows`

## 路线图原则

- 地图优先: 以历史地图和时间轴作为第一入口，人物、事件、朝代、文化、神话作为可关联图层和专题页。
- 数据可信: 任何新增数据都必须保留来源、许可和置信度字段，优先沉淀到 Prisma seed-data 或版本化静态 JSON。
- 契约稳定: 后端 DTO、Swagger、前端 service 类型和页面筛选项必须同步演进。
- 可验证: 每个里程碑都要对应测试、文档和模块状态矩阵更新。

## 已完成里程碑

### M1 治理 / 测试 / 重构基线

CHANGELOG 记录的 M1 成果包括:

- 治理文档: `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`CHANGELOG.md`、Issue/PR 模板、Dependabot。
- 后端基础治理: Swagger Bearer 认证方案预留、全局响应包装、日志拦截器、异常过滤器、分页 DTO。
- 数据治理: `backend/prisma/seed-data/*.json` 和幂等 seed 流程替代二进制 dev.db 依赖。
- 后端单元测试: 当前工作树可验证 `backend/src` 下已有 21 个 `*.spec.ts`，覆盖 dynasty/event/person/emperor/figure/religion/culture/mythology/common。
- 前端架构: 路由级懒加载、ErrorBoundary、地图优先布局、人物详情公共组件、多个 store 与 feature 模块。

当前需校准:

- README 和 CHANGELOG 提到 `doc/`、`SECURITY.md`、大量前端 Vitest 测试；本轮已补 `doc/` 与 `SECURITY.md`，但当前 `frontend/src` 下仍未发现 `*.test.*` 文件。
- PR lint 工作流为 informational，test 工作流只跑 test/type-check，尚未加入产物体积检查和强制 lint gate。

## 待完成里程碑

| 里程碑 | 优先级 | 模块范围 | 当前状态 | 目标状态 |
|---|---:|---|---|---|
| M2 API 契约补全 | P0 | dynasty/event/person/emperor/figure/religion/culture/mythology/map | 多数模块有列表/详情，person/culture/mythology/dynasty/event 已有 CRUD；emperor/figure/religion/map 多为只读 | 明确每个模块的 CRUD 边界，补齐需要的写接口、DTO 校验、Swagger 示例和错误语义 |
| M3 前端基础功能闭环 | P0 | people/mythology/culture/map/timeline/dynasties/emperors-cyber | 主页面可访问，部分模块已有列表、筛选、详情、编辑；近期修复了公共加载 hook、地图首屏和时间轴首帧无数据问题 | 每个 feature 至少具备列表、搜索/筛选、详情、错误态、空态、响应式和中文选中态 |
| M4 测试覆盖恢复 | P1 | 后端 Jest + 前端 Vitest | 后端 service/common spec 可验证；前端测试在当前工作树缺失 | 为关键 store、service、公共组件、页面工作流恢复/补齐 Vitest；CI 统一 test/type-check/lint |
| M5 性能与地图体验 | P1 | map/timeline/dynasties/emperors-cyber | 路由 lazy 已有；地图/时间轴使用 ECharts/MapLibre/Deck.gl/Three | 图片懒加载、地图图层降采样/缓存、时间轴大数据虚拟化、WebGL 资源释放审计 |
| M6 安全与可观测性 | P1 | backend/main/common/CI | Swagger 预留 JWT；全局日志/异常已有；SECURITY.md 已补待办 | 实现 helmet、throttler、结构化日志、JWT/AuthGuard 方案、生产 HTTPS/CORS 指引 |
| M7 发布与部署准备 | P2 | README/CONTRIBUTING/doc/DEPLOY/CHANGELOG/.github | README 已有快速开始；deploy workflow 存在；doc/DEPLOY 缺失 | 完成 DEPLOY 指南、README 现状校准、首个 release 摘要、构建产物体积检查 |

## 模块推进顺序

1. dynasty: 作为朝代表、时间轴、地图边界和帝王关联的基础维度，后端 CRUD 已补，下一步继续稳定前端表格/甘特视图和字段契约。
2. event: 时间轴和地图事件共享数据源，多标签 `eventType` 筛选、后端 CRUD、关联详情和前端事件管理入口已补齐，下一步补字段说明和前端测试。
3. person: 已有 CRUD 与人物档案 UI，下一步完善 API 错误、搜索、数据来源与前端测试。
4. emperor: 后端只读，前端同时服务人物 tab 和赛博帝王页，需明确是否需要写接口。
5. religion: 图谱查询已有，下一步完善图谱性能、节点详情、搜索高亮和测试。
6. culture: 学者/学派 CRUD 较完整，下一步优化表单校验、关联删除、详情体验和测试。
7. mythology: CRUD 和前端列表已有，下一步补齐表单测试、分类搜索、API/JSON 数据一致性。
8. map: 作为首页入口，需继续推进边界数据精度、缓存策略、事件地点解析和性能。

## 当前状态到目标状态摘要

| 模块 | 当前状态 | 目标状态 |
|---|---|---|
| 后端基础设施 | NestJS + Prisma + SQLite，统一响应、异常、日志、Swagger 已有 | 加入安全中间件、结构化日志、认证授权、缓存策略和完整安全文档 |
| 前端基础设施 | React 19 + Vite 8 + MUI v9 + Zustand，路由 lazy 与 ErrorBoundary 已有 | 公共加载、选择框、错误态、响应式和可访问性形成统一规范并测试覆盖 |
| 数据层 | 静态 JSON 和 Prisma seed-data 并存 | 明确 JSON/mock/api 三种模式职责，减少重复转换器，保留来源与许可 |
| CI/CD | test/type-check 工作流存在，lint 仅 informational | lint/type-check/test/build/size-limit 分层 gate，失败信号可执行 |

## 下一步行动

1. 沿 `event` 模块继续审查前端测试缺口，优先补事件管理字段说明、表单契约与 Vitest 覆盖。
2. 为朝代前端补字段契约说明，并评估是否需要新增/编辑入口或继续保持只读展示。
3. 按 `SECURITY.md` 待办拆解 helmet、throttler、JWT/AuthGuard 和结构化日志的落地顺序。
