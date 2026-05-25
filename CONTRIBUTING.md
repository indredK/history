# 贡献指南 (Contributing Guide)

感谢你对**中国历史全视界**的关注!本文档帮助你快速参与项目。

---

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境](#开发环境)
- [分支策略](#分支策略)
- [提交规范](#提交规范)
- [代码风格](#代码风格)
- [Pull Request 流程](#pull-request-流程)
- [数据贡献](#数据贡献)
- [获取帮助](#获取帮助)

---

## 行为准则

参与本项目即同意遵守 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)。任何违反规范的行为都可向维护者私信举报。

---

## 如何贡献

| 类型 | 说明 |
|---|---|
| 🐛 **Bug 修复** | 在 Issue 中描述复现步骤,然后提交 PR |
| ✨ **新功能** | 建议先开 Issue 讨论方向,避免做完发现冲突 |
| 📚 **文档** | typo、翻译、补充示例,直接 PR |
| 📊 **数据** | 见下方[数据贡献](#数据贡献)章节 |
| 🎨 **UI/UX** | 截图 + Issue 讨论后再动手 |
| 🌍 **国际化** | 欢迎补充英文/日文翻译 |

**首次贡献?** 看带 `good-first-issue` 标签的任务,或直接修文档/typo。

---

## 开发环境

### 前置要求

- **Bun** >= 1.3.0(主用包管理器与运行时)
- **Node.js** >= 20.19.0(部分工具仍需)
- **Git** >= 2.30

无需 Docker、PostgreSQL 或 PostGIS — 项目使用 SQLite,GIS 在前端用 GeoJSON 实现。

### 启动

```bash
# 1. Fork 然后 clone 你的 fork
git clone https://github.com/<你的用户名>/history.git
cd history

# 2. 安装依赖(根目录一次性装上前后端)
bun install
cd frontend && bun install
cd ../backend && bun install
cd ..

# 或一键脚本
bun run install:all

# 3. 初始化数据库
cd backend
bunx prisma migrate dev
bunx prisma db seed
cd ..

# 4. 启动前后端(并行)
bun run dev
# 前端 → http://localhost:5173
# 后端 → http://localhost:3001
# Swagger → http://localhost:3001/api/docs
```

### 常用脚本

```bash
bun run lint              # 前后端 lint
bun run lint:fix          # 自动修复
bun run type-check        # 前后端 TypeScript 检查
bun run build             # 生产构建
cd backend && bun test    # 后端单元测试
cd frontend && bun test   # 前端 vitest
bun run db:reset          # 重置数据库并重新 seed
```

---

## 分支策略

- `main` — 主分支,始终可部署
- `feature/<short-desc>` — 新功能(从 main 切出)
- `fix/<short-desc>` — bug 修复
- `docs/<short-desc>` — 文档变更
- `refactor/<short-desc>` — 不改行为的重构
- `chore/<short-desc>` — 工具链/依赖

不允许直接 push 到 `main`,所有变更必须通过 PR。

---

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type**(必填):
- `feat` — 新功能
- `fix` — bug 修复
- `docs` — 文档
- `refactor` — 重构(不改行为)
- `perf` — 性能优化
- `test` — 测试相关
- `chore` — 构建/工具
- `ci` — CI 配置
- `style` — 代码格式(不改逻辑)

**scope**(可选): `backend` / `frontend` / `prisma` / `ci` 等。

**示例**:
```
feat(backend): 加入 throttler 速率限制
fix(frontend): TimelineChart 滚动越界
refactor(frontend): 拆分 ReligionGraph 大组件 (P1-9)
docs: 更新 SECURITY.md 已实现项
```

---

## 代码风格

- 后端:NestJS 官方 ESLint + Prettier
- 前端:Vite + React ESLint(`bunx eslint src --ext ts,tsx`)
- TypeScript `strict: true` + `exactOptionalPropertyTypes: true`
- 禁用 `any` 类型(后端 Service 已全部用 `Prisma.XxxWhereInput`)
- 函数命名:动词开头,清晰描述意图
- 组件命名:PascalCase;hook 以 `use` 开头
- 文件大小:单文件建议 < 260 行(详见 [ARCHITECTURE_ISSUES.md](./ARCHITECTURE_ISSUES.md) §2.3)

提交前请跑:
```bash
bun run lint
bun run type-check
```

---

## Pull Request 流程

1. **同步 main**:`git fetch upstream && git rebase upstream/main`
2. **跑测试**:`bun run lint && bun run type-check && cd backend && bun test`
3. **写好 PR 描述**:用仓库自带的 [PR 模板](./.github/pull_request_template.md)
4. **关联 Issue**:在 PR 描述里写 `Closes #123`
5. **请求审查**:@ 一位维护者
6. **回应反馈**:CR 评论一一回复或补改
7. **合并**:维护者合并(使用 Squash merge)

PR 必须满足:
- [ ] CI 全绿(lint / type-check / test)
- [ ] 新代码有合理覆盖率(尽量加单测)
- [ ] 涉及 API 变更时更新前端类型与文档
- [ ] 涉及数据库变更时附 Prisma migration

---

## 数据贡献

历史数据是本项目核心资产之一,有专门流程:

### 流程

1. 在 `frontend/public/data/raw/` 下放原始数据(GeoJSON / CSV / JSON)
2. 在 `frontend/public/data/SOURCES.md` 补充来源条目(机构、许可、置信度)
3. 数据格式要求:
   - 边界:GeoJSON,坐标系 EPSG:4326,含 `valid_from` / `valid_to` 字段
   - 人物:JSON,字段对齐 Prisma schema 的 `Person` / `<Dynasty>Figure`
   - 事件:JSON,含 `year` / `dynastyId` / `participants` 等
4. **重要**:不要提交未经许可的数据。`CC-BY` / 公有领域 / 自制数据均可,商业许可数据禁止
5. PR 描述里说明数据来源、是否人工校准、引用方式

### 数据许可

代码采用 MIT,数据采用 **CC-BY-4.0**(后续会有 `DATA_LICENSE.md`)。请保留原始来源署名。

---

## 获取帮助

- 💬 [GitHub Discussions](https://github.com/) — 功能讨论、问题求助
- 🐛 [Issues](https://github.com/) — bug 报告
- 🔒 [SECURITY.md](./SECURITY.md) — 安全漏洞上报
- 📖 [ARCHITECTURE_ISSUES.md](./ARCHITECTURE_ISSUES.md) — 当前架构问题与待办

---

**祝贡献愉快!** 🎉
