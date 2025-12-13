# 快速参考 (Quick Reference)

> 用 5 分钟快速了解项目现状与下一步行动

---

## 📊 项目核心指标

| 指标 | 当前状态 | 目标 |
|------|--------|------|
| **开发阶段** | 🔄 Phase 0: MVP 初期 | 完整的交互平台 |
| **Git 提交数** | 3 | 100+ |
| **代码行数** | ~100（文档） | 10K+ |
| **单元测试覆盖** | 0% | 80%+ |
| **数据条目** | 0（待导入） | 1000+（事件、人物、地图） |
| **前端组件** | 0 | 30+ |
| **API 端点** | 0 | 50+ |
| **部署地点** | 本地 | GitHub Pages + 云服务 |

---

## 🎯 立即可做的 5 件事

### 1️⃣ 搭建本地开发环境（30 分钟）

**检查清单**:
```bash
# 检查 Node.js
node --version  # >= 16

# 检查 PostgreSQL + PostGIS
psql --version
psql -c "CREATE EXTENSION postgis;" -d testdb

# 检查 Git
git --version

# 克隆与进入项目
git clone <your-fork-url>
cd chinese-historical-panorama

# 查看分支
git branch -a
```

**遇到问题？** 参考 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md#开发者工具链与检查清单)

---

### 2️⃣ 创建你的首个功能分支（5 分钟）

```bash
# 选择任务（查看 ROADMAP.md）
# 示例：添加时间轴组件

git fetch origin
git checkout -b feature/timeline-component

# 做出改动
# ...

# 提交
git add .
git commit -m "feat(frontend): add interactive timeline component"
```

---

### 3️⃣ 准备第一条数据贡献（20 分钟）

**数据格式示例** - 历史事件 (GeoJSON):

```json
{
  "type": "Feature",
  "properties": {
    "id": "evt_唐武周革命",
    "title": "武周革命",
    "start_year": 690,
    "end_year": 705,
    "description": "武则天建立周朝...",
    "event_type": "political_change",
    "source": "资治通鉴",
    "contributors": ["github_username"]
  },
  "geometry": {
    "type": "Point",
    "coordinates": [104.07, 34.27]
  }
}
```

**如何贡献?** 见 [CONTRIBUTING.md](./CONTRIBUTING.md#数据贡献指南)

---

### 4️⃣ 参与代码审查（10 分钟/周）

```bash
# 检查待审 PR
open https://github.com/your-org/chinese-historical-panorama/pulls

# 本地验证 PR
git fetch origin pull/<PR_ID>/head:pr-<PR_ID>
git checkout pr-<PR_ID>
npm install && npm run test
```

---

### 5️⃣ 在 Discussions 中提出想法（15 分钟）

- [功能建议讨论](https://github.com)  
- [数据来源分享](https://github.com)  
- [技术方案讨论](https://github.com)

---

## 📝 当前待做的任务（按优先级）

### 🔴 高优先级（本周）

| # | 任务 | 难度 | 预计时间 | 负责人 |
|---|------|------|--------|-------|
| 1 | [初始化后端项目（Express/Fastify + Prisma）](./IMPLEMENTATION_GUIDE.md#12-后端框架搭建) | ⭐⭐ | 2-3 天 | 需要 |
| 2 | [创建 PostgreSQL 表结构与 ORM 映射](./IMPLEMENTATION_GUIDE.md#11-数据库设计与表结构) | ⭐⭐ | 1-2 天 | 需要 |
| 3 | [实现基础 CRUD API（/persons, /events）](./IMPLEMENTATION_GUIDE.md#13-基础-api-实现) | ⭐⭐ | 2 天 | 需要 |
| 4 | [准备样例数据 50+ 事件 + 20 人物](./IMPLEMENTATION_GUIDE.md#14-样例数据导入) | ⭐ | 1-2 天 | 需要 |

### 🟡 中优先级（第 2 周）

| # | 任务 | 难度 | 预计时间 | 负责人 |
|---|------|------|--------|-------|
| 5 | [创建 React 项目并集成 MapLibre GL](./IMPLEMENTATION_GUIDE.md#21-项目初始化) | ⭐⭐ | 1 天 | 需要 |
| 6 | [实现时间轴组件与年份滑块](./IMPLEMENTATION_GUIDE.md#23-核心组件实现) | ⭐⭐⭐ | 2 天 | 需要 |
| 7 | [实现地图交互：加载 GeoJSON + 图层切换](./IMPLEMENTATION_GUIDE.md#23-核心组件实现) | ⭐⭐ | 2 天 | 需要 |

### 🟢 低优先级（第 3 周后）

| # | 任务 | 难度 | 预计时间 | 负责人 |
|---|------|------|--------|-------|
| 8 | [下载并处理 CHGIS 历史地图数据](./IMPLEMENTATION_GUIDE.md#31-数据采集脚本) | ⭐⭐⭐ | 3-5 天 | 需要 |
| 9 | [生成矢量瓦片（Tippecanoe）](./IMPLEMENTATION_GUIDE.md#33-使用-tippecanoe-生成矢量瓦片) | ⭐⭐ | 1 天 | 需要 |
| 10 | [配置 GitHub Actions CI/CD](./IMPLEMENTATION_GUIDE.md#41-前端-cicd) | ⭐⭐⭐ | 2 天 | 需要 |

---

## 🔗 重要链接

| 链接 | 说明 |
|------|------|
| [ROADMAP.md](./ROADMAP.md) | 完整的项目路线图与里程碑 |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | 代码与工具的详细实施指南 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 贡献流程与代码规范 |
| [DATA_LICENSE.md](./DATA_LICENSE.md) | 数据许可与署名要求 |
| [CHGIS 数据](http://www.fas.harvard.edu/~chgis/) | 中国历史地理数据源 |
| [OpenHistoricalMap](https://www.openhistoricalmap.org/) | 开放历史地图 |

---

## 💬 寻求帮助

### 常见问题

**Q: 我是新手，不知道从哪里开始？**  
A: 从 [`good-first-issue`](https://github.com) 标签的任务开始，或在 [Discussions](https://github.com) 中提问。

**Q: 我想贡献数据，但不知道格式？**  
A: 查看 [CONTRIBUTING.md 中的数据贡献指南](./CONTRIBUTING.md#数据贡献指南) 或提交一个样例问询 Issue。

**Q: 我发现了 bug，应该怎么办？**  
A: 在 [Issues](https://github.com) 中提交，使用 BUG 模板，提供复现步骤与环境信息。

**Q: 我想参与代码审查，但不确定审查什么？**  
A: 查看开放的 [Pull Requests](https://github.com)，选择任何一个阅读改动、运行代码、提供反馈。

---

## 📅 周期性任务

### 每周
- [ ] 检查并回应新 Issues（周一）
- [ ] 审查待审 PR（周三）
- [ ] 发布进度更新（周五）

### 每月
- [ ] 发布版本（v0.1, v0.2...）
- [ ] 更新 CHANGELOG
- [ ] 社区反馈总结

### 每季度
- [ ] 重大功能发布
- [ ] 性能优化与重构
- [ ] 长期规划评审

---

## 🎓 学习资源

### 前端开发
- [React 官方文档](https://react.dev)
- [MapLibre GL 教程](https://maplibre.org/)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### 后端开发
- [Fastify 官方文档](https://www.fastify.io/)
- [Prisma ORM 文档](https://www.prisma.io/docs/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [PostGIS 空间查询](https://postgis.net/)

### 地理信息
- [GDAL/OGR 教程](https://gdal.org/)
- [Tippecanoe 矢量瓦片](https://github.com/mapbox/tippecanoe)
- [Web Mercator 坐标系](https://en.wikipedia.org/wiki/Web_Mercator_projection)
- [GeoJSON RFC 7946](https://tools.ietf.org/html/rfc7946)

### 历史与地理
- [CHGIS 数据手册](https://www.fas.harvard.edu/~chgis/data/)
- [中国行政区划演变](https://www.toutiao.com/)（参考资料）
- [地方志数字库](https://www.sbxz.ac.cn/)

---

## 🚀 下一步行动（优先顺序）

### 今天（Day 0）
- [ ] Star 项目并 Fork
- [ ] 阅读本 Quick Reference
- [ ] 检查本地开发环境

### 本周（Week 1）
- [ ] 建立开发分支
- [ ] 完成后端项目初始化
- [ ] 提交第一个 commit

### 下周（Week 2）
- [ ] 完成后端 API
- [ ] 开始前端项目
- [ ] 准备样例数据

### 第 3 周（Week 3）
- [ ] 实现前端核心组件
- [ ] 后端与前端集成测试
- [ ] 部署到本地演示环境

---

## 📊 项目进度看板

```
Phase 0: MVP (4-6 周)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ [████████░░░░░░░░░░] 30% 完成

任务分布:
- 🔄 进行中: 基础文档与治理框架 (本周完成)
- ⏳ 待开始: 后端数据模型与 API
- ⏳ 待开始: 前端原型开发
- ⏳ 待开始: GIS 数据管线
- ⏳ 待开始: CI/CD 部署

预期里程碑:
- v0.1.0: 基础平台（可展示，可编辑数据）- 2026-01-09
- v0.2.0: 完整 GIS + CI/CD - 2026-02-04
```

---

## ✨ 致谢

感谢所有已参与或即将参与该项目的贡献者！你的每一行代码、每一条数据、每一条建议都在塑造这个项目的未来。

---

**准备好了吗？选择一个任务，创建分支，开始编码！** 🎉

---

*最后更新: 2025-12-13*  
*版本: 1.0*  
*项目阶段: Phase 0 - MVP (初期)*
