# 中国历史全视界 (Chinese Historical Panorama)

> 一个多维度的中国历史信息可视化平台 | An interactive multi-dimensional visualization platform for Chinese history

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Data License: CC-BY-4.0](https://img.shields.io/badge/Data%20License-CC--BY--4.0-lightgrey)](https://creativecommons.org/licenses/by/4.0/)
[![Contributing](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](./CONTRIBUTING.md)

---

## 📖 项目简介

**中国历史全视界** 是一个开源项目，旨在构建一个**多维度、多层级**的中国历史信息可视化平台。通过整合时间轴、历史事件、历史人物、地点等多个维度的数据，并结合 **Historical GIS 技术**实现中国疆域与行政区划的**动态演变可视化**，为研究者、教育工作者和爱好者提供一个强大的探索工具。

### 🎯 核心特性

- **多维筛选与展示**：支持按时间轴、历史事件、历史人物、地点等维度进行数据筛选和关联展示
- **历史地图动态演变**：随时间轴变化，实时展示中国疆域、行政区划的演变过程
- **交互式时间轴**：拖动、缩放、跳转到任意历史时期，自动更新地图与事件列表
- **事件与人物关联**：完整展示历史事件的参与者、发生地点、历史影响
- **开源与协作**：托管于 GitHub，欢迎贡献者完善数据与功能

---

## 🚀 快速开始

### 前置要求

- **Bun** >= 1.3（首选包管理器与运行时）
- **Node.js** >= 20.19（用于部分工具链兼容,非必需运行时）
- 操作系统：macOS / Linux / Windows(WSL2)

> 当前栈使用 **SQLite** 作为后端数据库,数据文件位于 `backend/prisma/dev.db`,**无需 PostgreSQL/PostGIS/Docker** 即可本地开发。

### 本地开发(3 分钟)

#### 1. 克隆仓库 & 安装依赖

```bash
git clone <repo-url> chinese-historical-panorama
cd chinese-historical-panorama
bun install            # 根目录执行,自动安装 frontend / backend workspace
```

#### 2. 准备数据库

```bash
cd backend
bunx prisma migrate deploy   # 应用现有迁移到 SQLite
bunx prisma generate         # 生成 Prisma Client
# 可选:导入样例数据
bun run seed
```

#### 3. 启动开发服务器

回到仓库根目录:

```bash
bun run dev      # 并行启动 frontend (5173) + backend (3001)
```

或分别启动:

```bash
# 前端
cd frontend && bun run dev      # http://localhost:5173

# 后端
cd backend && bun run start:dev # http://localhost:3001/api/v1
                                # Swagger: http://localhost:3001/api/docs
```

#### 4. 打开浏览器

访问 [http://localhost:5173](http://localhost:5173) 查看本地实例。

### 常用脚本

```bash
bun run lint           # 同时跑前端 + 后端 ESLint
bun run type-check     # 同时跑前端 + 后端 TypeScript 类型检查
bun run build          # 构建前端 + 后端产物

# 后端测试
cd backend && bun test          # 单元测试
cd backend && bun test:e2e      # 端到端测试

# 前端测试
cd frontend && bun test         # Vitest
```

---

## 📁 项目结构

```
chinese-historical-panorama/
├── README.md                     # 项目主文档
├── CHANGELOG.md                  # 变更日志(Keep a Changelog)
├── CONTRIBUTING.md               # 贡献指南
├── CODE_OF_CONDUCT.md            # 社区行为准则(Contributor Covenant)
├── SECURITY.md                   # 安全漏洞上报流程
├── LICENSE                       # MIT
│
├── doc/                          # 内部 / 开发面向文档
│   ├── ROADMAP.md                # 开发路线图与里程碑
│   ├── ARCHITECTURE_ISSUES.md    # 架构债务清单与进展
│   └── DEPLOY.md                 # 部署指南
│
├── backend/                      # NestJS 11 + Prisma 7 + SQLite
│   ├── src/
│   │   ├── common/               # 公共拦截器 / 过滤器 / DTO
│   │   ├── prisma/               # PrismaService
│   │   ├── dynasty/ event/ ...   # 各业务模块(controller + service + dto)
│   │   ├── app.module.ts
│   │   └── main.ts               # Nest 引导,Swagger 配置
│   ├── prisma/
│   │   ├── schema.prisma         # 数据库 schema
│   │   ├── migrations/           # 迁移脚本
│   │   └── dev.db                # SQLite 数据(本地,gitignored)
│   ├── test/                     # e2e 测试
│   └── Dockerfile                # 生产部署镜像
│
├── frontend/                     # React 19 + Vite 8 + MUI v9 + Zustand
│   ├── src/
│   │   ├── components/           # 通用 UI 组件
│   │   ├── features/             # 业务功能模块(timeline / map / people ...)
│   │   ├── pages/                # 页面壳组件 + NotFoundPage
│   │   ├── router/               # 路由配置
│   │   ├── services/             # API 客户端(统一 axios 封装)
│   │   ├── stores/               # Zustand 状态
│   │   └── theme/                # MUI 主题
│   ├── public/data/              # 静态数据资源(GeoJSON 等)
│   └── Dockerfile                # 生产 Nginx 镜像
│
├── scripts/                      # 仓库级脚本
└── .github/
    ├── workflows/                # GitHub Actions CI/CD
    ├── ISSUE_TEMPLATE/           # Bug / Feature / Data 模板
    ├── pull_request_template.md  # PR 模板
    └── dependabot.yml            # 依赖更新自动化
```

> 注：上面省略了运行时生成的 `dist/`、`node_modules/`、`coverage/` 等目录。

---

## 🏗️ 技术栈(实际使用)

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端框架** | React + TypeScript | React 19 / TS 6 |
| **构建工具** | Vite + Rolldown + OXC minifier | Vite 8 |
| **UI 库** | Material UI + Emotion | MUI v9 |
| **状态管理** | Zustand | v5 |
| **路由** | React Router | v7 |
| **地图渲染** | MapLibre GL + Deck.gl | maplibre 5 / deck.gl 9 |
| **3D 可视化** | three + @react-three/* | three r170+ |
| **HTTP 客户端** | axios(统一封装、错误兜底) | — |
| **后端框架** | NestJS | v11 |
| **ORM** | Prisma | v7 |
| **数据库** | SQLite(via @libsql/client + @prisma/adapter-libsql) | — |
| **API 文档** | Swagger / OpenAPI | @nestjs/swagger 11 |
| **包管理 / 运行时** | Bun | 1.3+ |
| **测试** | Vitest(前端) / Jest(后端) | — |
| **部署** | Dockerfile + GitHub Actions(可选) | — |

> 当前栈相对最初的 `ROADMAP` 设想做了化简：用 **SQLite** 替代 PostgreSQL+PostGIS(GIS 计算放在前端),用 **Bun workspace** 替代多包工具链。
> 详见 [`doc/ROADMAP.md`](./doc/ROADMAP.md) 与 [`doc/ARCHITECTURE_ISSUES.md`](./doc/ARCHITECTURE_ISSUES.md)。

---

## 📊 数据来源与许可

项目的历史数据主要来自学术与开放资源（如 CHGIS、OpenHistoricalMap、地方志、学术论文等），来源清单维护在 `frontend/public/data/SOURCES.md`(逐步完善中)。

- **代码许可**：MIT(详见 [LICENSE](./LICENSE))
- **数据许可**：CC-BY-4.0(数据贡献需明确来源,详见 [CONTRIBUTING.md → 数据贡献](./CONTRIBUTING.md))

---

## 🤝 如何贡献

欢迎代码、数据、文档、设计等各类贡献。

1. 阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)(分支策略、提交规范、代码风格)
2. 浏览 [doc/ROADMAP.md](./doc/ROADMAP.md) 与 [doc/ARCHITECTURE_ISSUES.md](./doc/ARCHITECTURE_ISSUES.md) 了解当前优先项
3. 在 [Issues](../../issues) 中选择或创建任务,使用对应模板
4. Fork → 创建 `feature/* / fix/*` 分支 → 提交 PR(请填写 PR 模板)

提交前请运行:

```bash
bun run lint && bun run type-check
cd backend && bun test
```

数据贡献请额外提供来源与许可信息,详见 [`📊 数据贡献` Issue 模板](./.github/ISSUE_TEMPLATE/data_contribution.yml)。

---

## 🔒 安全

请勿在公开 Issue 中报告安全漏洞,见 [SECURITY.md](./SECURITY.md)。

---

## 📄 许可证

- **代码**:[MIT License](./LICENSE)
- **数据**:CC-BY-4.0

---

**祝你探索历史愉快!** 🎭📜🗺️
