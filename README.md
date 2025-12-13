# 中国历史全视界 (Chinese Historical Panorama)

> 一个多维度的中国历史信息可视化平台 | An interactive multi-dimensional visualization platform for Chinese history

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Data License: CC-BY-4.0](https://img.shields.io/badge/Data%20License-CC--BY--4.0-lightgrey)](https://creativecommons.org/licenses/by/4.0/)
[![GitHub Stars](https://img.shields.io/github/stars/your-org/chinese-historical-panorama?style=social)](https://github.com)
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
- **学术引用**：所有数据均支持来源追踪与学术引用

---

## 🚀 快速开始

### 前置要求

- Node.js >= 16
- PostgreSQL >= 12 + PostGIS extension
- Docker & Docker Compose（可选，用于容器化部署）

### 本地开发（5 分钟）

#### 1. 克隆仓库
```bash
git clone https://github.com/your-org/chinese-historical-panorama.git
cd chinese-historical-panorama
```

#### 2. 启动数据库（使用 Docker）
```bash
docker-compose up -d postgres
```

或本地安装 PostgreSQL 并启用 PostGIS：
```bash
createdb history_db
psql history_db -c "CREATE EXTENSION postgis;"
```

#### 3. 初始化后端
```bash
cd backend
npm install
npm run migrate  # 运行数据库迁移
npm run seed     # 导入样例数据
npm run dev      # 启动开发服务器 http://localhost:3000
```

#### 4. 启动前端
```bash
cd frontend
npm install
npm run dev      # 启动开发服务器 http://localhost:5173
```

#### 5. 打开浏览器
访问 [http://localhost:5173](http://localhost:5173) 查看演示站点

---

## 📁 项目结构

```
chinese-historical-panorama/
├── README.md                    # 项目主文档
├── ROADMAP.md                   # 开发路线图与里程碑
├── CONTRIBUTING.md              # 贡献指南
├── CODE_OF_CONDUCT.md          # 社区行为准则
├── LICENSE                      # 代码许可 (MIT)
├── DATA_LICENSE.md             # 数据许可 (CC-BY-4.0)
├── SECURITY.md                 # 安全漏洞上报流程
│
├── backend/                     # 后端服务 (Node.js / FastAPI)
│   ├── src/
│   │   ├── models/             # 数据模型与 ORM
│   │   ├── routes/             # API 路由
│   │   ├── services/           # 业务逻辑
│   │   └── utils/              # 工具函数
│   ├── migrations/             # 数据库迁移脚本
│   ├── seeds/                  # 样例数据导入脚本
│   └── tests/                  # 单元测试与集成测试
│
├── frontend/                    # 前端应用 (React + TypeScript)
│   ├── src/
│   │   ├── components/         # React 组件库
│   │   ├── pages/              # 页面模板
│   │   ├── hooks/              # 自定义 hooks
│   │   ├── stores/             # 状态管理 (Redux / Zustand)
│   │   ├── styles/             # 全局样式
│   │   └── utils/              # 工具函数
│   ├── public/                 # 静态资源
│   └── tests/                  # 单元测试与集成测试
│
├── data/                        # 数据文件与处理脚本
│   ├── raw/                    # 原始数据（CHGIS、历史记录等）
│   ├── processed/              # 清洗后的数据（GeoJSON、CSV）
│   ├── scripts/                # GDAL、Tippecanoe 处理脚本
│   ├── tiles/                  # 矢量瓦片 (MBTiles / 切片集)
│   └── SOURCES.md              # 数据来源清单与许可
│
├── docs/                        # 技术文档
│   ├── ARCHITECTURE.md         # 系统架构设计
│   ├── DATA_MODEL.md           # 数据模型与 ER 图
│   ├── SCHEMA.md               # 数据库表结构详解
│   ├── GIS_PIPELINE.md         # 地理数据处理管线
│   ├── DEPLOYMENT.md           # 部署指南（开发/生产）
│   ├── API.md                  # API 文档与示例
│   └── CONTRIBUTING_DEV.md     # 开发者深度指南
│
├── .github/                     # GitHub 配置
│   ├── workflows/              # CI/CD pipeline（Actions）
│   ├── ISSUE_TEMPLATE/         # Issue 模板
│   ├── PULL_REQUEST_TEMPLATE.md # PR 模板
│   └── dependabot.yml          # 依赖更新自动化
│
├── docker-compose.yml          # 本地开发容器编排
├── docker-compose.prod.yml     # 生产环境容器编排
└── .gitignore
```

---

## 🏗️ 技术栈

| 层级 | 推荐技术 | 说明 |
|------|--------|------|
| **前端框架** | React 18 + TypeScript | 声明式 UI，类型安全 |
| **地图库** | MapLibre GL + Deck.gl | 矢量瓦片渲染 + GPU 加速可视化 |
| **时间轴** | visx / vis.js Timeline | 可交互的时间线组件 |
| **状态管理** | Redux Toolkit / Zustand | 全局状态管理 |
| **样式** | Tailwind CSS / styled-components | 响应式 UI 开发 |
| **后端框架** | Node.js (NestJS/Fastify) 或 Python (FastAPI) | 高性能 API 服务 |
| **数据库** | PostgreSQL + PostGIS | 关系数据库 + 地理空间扩展 |
| **ORM** | Prisma / SQLAlchemy | 数据层抽象 |
| **矢量瓦片** | Tippecanoe / GeoServer | GeoJSON → MBTiles 转换 |
| **部署** | Docker + GitHub Actions | 容器化与 CI/CD 自动化 |
| **CDN / 对象存储** | S3 / 阿里 OSS / 腾讯 COS | 静态资源与瓦片发布 |

---

## 📊 数据来源与许可

本项目的历史数据来自以下学术与开放资源：

- **CHGIS**（中国历史地理信息系统，哈佛大学 / 中研院）
- **OpenHistoricalMap**（开放地理志愿者项目）
- **David Rumsey Map Collection**（历史地图扫描档案库）
- 国家图书馆、地方志、学术论文及社区贡献

所有数据遵循相应的开源许可（详见 [DATA_LICENSE.md](./DATA_LICENSE.md)）。

**代码许可**: MIT（自由使用与修改，保留署名）  
**数据许可**: CC-BY-4.0（署名-保持一致）

---

## 🤝 如何贡献

我们热烈欢迎各类贡献！无论你是开发者、数据专家、设计师还是历史爱好者，都可以参与：

### 贡献类型

- **代码贡献**：功能开发、bug 修复、性能优化、测试编写
- **数据贡献**：补充新历史事件、人物、地图数据，改进已有数据质量
- **文档贡献**：翻译、写教程、完善 API 文档、补充数据说明
- **设计贡献**：UI/UX 改进、可视化优化、新特性原型设计
- **翻译贡献**：国际化（英文、日文、韩文等）

### 快速入门

1. 查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 详细指南
2. 查看 [ROADMAP.md](./ROADMAP.md) 了解当前开发阶段与优先项
3. 选择一个 [issue](https://github.com/your-org/chinese-historical-panorama/issues) 或提出新想法
4. Fork → 创建 feature 分支 → 提交 PR → 等待审查

**首次贡献？** 寻找标有 [`good-first-issue`](https://github.com) 或 [`help-wanted`](https://github.com) 的任务开始！

---

## 📚 文档与资源

### 核心文档

- [开发路线图与里程碑](./ROADMAP.md)
- [系统架构设计](./docs/ARCHITECTURE.md)
- [数据模型与 ER 图](./docs/DATA_MODEL.md)
- [API 文档](./docs/API.md)
- [GIS 数据处理管线](./docs/GIS_PIPELINE.md)
- [部署指南](./docs/DEPLOYMENT.md)

### 学术参考

- [CHGIS 数据手册](https://www.fas.harvard.edu/~chgis/)
- [OpenHistoricalMap 百科](https://www.openhistoricalmap.org/)
- 中国地方志库、民国时期地图档案等

### 社区讨论

- [GitHub Discussions](https://github.com/your-org/chinese-historical-panorama/discussions) - 功能讨论、问题解答
- [Issue Tracker](https://github.com/your-org/chinese-historical-panorama/issues) - bug 报告与功能请求
- 微信公众号（建设中） | Discord 频道（建设中）

---

## 🎓 学术引用

如果你在学术或研究中使用了本项目的数据或代码，请按以下方式引用：

```bibtex
@software{chinese_historical_panorama2025,
  title={Chinese Historical Panorama: An Interactive Multi-dimensional Visualization Platform},
  author={Contributors},
  year={2025},
  url={https://github.com/your-org/chinese-historical-panorama},
  license={MIT (code), CC-BY-4.0 (data)}
}
```

---

## 🐛 反馈与支持

- **发现 bug？** 请在 [Issues](https://github.com/your-org/chinese-historical-panorama/issues) 中详细描述
- **有功能建议？** 欢迎开启 [Discussion](https://github.com/your-org/chinese-historical-panorama/discussions) 或提交 Issue
- **安全漏洞？** 请参考 [SECURITY.md](./SECURITY.md) 安全上报流程

---

## 📈 项目现状与计划

| 阶段 | 目标 | 预计完成 | 状态 |
|------|------|--------|------|
| **Phase 0: MVP** | 基础展示平台、时间轴、地图、事件列表 | 2026-01-09 | 🔄 进行中 |
| **Phase 1: 数据 & 部署** | 完整数据管线、CI/CD、生产环境 | 2026-02-04 | ⏳ 计划中 |
| **Phase 2: 社区与扩展** | 活跃社区、用户贡献、地区与主题扩展 | 2026-Q2 | 📅 规划中 |

详见 [ROADMAP.md](./ROADMAP.md)

---

## 📄 许可证

- **代码**: MIT License（详见 [LICENSE](./LICENSE)）
- **数据**: CC-BY-4.0（详见 [DATA_LICENSE.md](./DATA_LICENSE.md)）

---

## 💬 社区与反馈

<div align="center">

🌟 喜欢这个项目？请点击 Star ⭐  
🐛 遇到问题？请在 Issue 中反馈  
🤝 想参与开发？欢迎 Fork 并提交 PR  

</div>

---

## 致谢

感谢以下机构与项目为本平台提供的数据与灵感：

- Harvard CHGIS 项目
- OpenHistoricalMap 社区
- David Rumsey Map Collection
- 开源社区的无数贡献者

---

**祝你探索历史愉快！** 🎭📜🗺️
