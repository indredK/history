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

### Changed
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

### Removed
- 废弃的 `frontend/src/services_backup/` 目录

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
