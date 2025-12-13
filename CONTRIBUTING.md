# 贡献指南 (Contributing Guidelines)

首先，感谢你对 **中国历史全视界** 项目的兴趣！我们热烈欢迎各类贡献者加入我们的社区。本文档将指导你如何以最有效的方式参与项目。

---

## 📋 目录

1. [行为准则](#行为准则)
2. [贡献类型](#贡献类型)
3. [开发环境设置](#开发环境设置)
4. [工作流程](#工作流程)
5. [代码风格与规范](#代码风格与规范)
6. [提交 Issue](#提交-issue)
7. [提交 Pull Request](#提交-pull-request)
8. [代码审查过程](#代码审查过程)
9. [数据贡献指南](#数据贡献指南)
10. [许可与署名](#许可与署名)

---

## 行为准则

我们采纳 [Contributor Covenant](https://www.contributor-covenant.org/) 作为本项目的行为准则，请参考 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)。

**简而言之**：
- 尊重所有参与者，无论背景或身份
- 明确、建设性地交流
- 接受批评，快速改正错误
- 关注项目目标，而非个人观点冲突

---

## 贡献类型

### 1. 代码贡献
- **功能开发**：实现新特性（时间轴、地图交互、查询功能等）
- **Bug 修复**：修复已报告的问题
- **性能优化**：改进代码性能或 UX 响应速度
- **测试编写**：补充单元测试、集成测试或端到端测试
- **重构与清理**：改进代码质量、去除技术债

### 2. 数据贡献
- **添加历史事件**：补充新的历史事件记录与相关信息
- **添加历史人物**：完善人物传记、年代信息、相关事件
- **地图数据**：补充或改进不同时期的疆域与行政区划边界
- **数据改进**：修正已有数据的错误、补充缺失字段、优化数据结构
- **数据来源验证**：为已有数据补充学术来源与引用

### 3. 文档贡献
- **编写或翻译文档**：API 文档、用户指南、技术文档
- **修正文档**：改正语法、补充说明、更新过时内容
- **教程与示例**：编写使用教程、示例代码、演示脚本
- **本地化**：翻译项目文档为其他语言

### 4. 设计贡献
- **UI/UX 改进**：界面设计优化、用户体验提升
- **可视化设计**：地图样式、色彩方案、图表展示优化
- **原型设计**：为新功能绘制原型或交互示意图

### 5. 其他贡献
- **错误反馈**：报告 bug 并提供复现步骤
- **功能建议**：提出有意义的新功能或改进建议
- **社区维护**：帮助回答问题、审查 PR、参与讨论

---

## 开发环境设置

### 前置要求

- **Node.js** >= 16（推荐 18 LTS）
- **npm** >= 8 或 **yarn**
- **Git** >= 2.30
- **Docker** & **Docker Compose**（可选，用于数据库与服务容器化）
- **PostgreSQL** >= 12 + **PostGIS**（或通过 Docker 使用）

### 步骤 1：Fork 与克隆

```bash
# 1. Fork 项目（访问 GitHub 网页版，点击 Fork）

# 2. 克隆你的 Fork
git clone https://github.com/<your-username>/chinese-historical-panorama.git
cd chinese-historical-panorama

# 3. 添加上游远程（upstream）用于同步更新
git remote add upstream https://github.com/original-org/chinese-historical-panorama.git
```

### 步骤 2：创建开发分支

```bash
# 同步最新的代码
git fetch upstream main
git rebase upstream/main

# 创建你的特性分支
git checkout -b feature/your-feature-name
# 或修复分支
git checkout -b fix/your-bug-fix
```

### 步骤 3：本地开发环境

#### 启动数据库
```bash
# 方式 A：使用 Docker Compose（推荐）
docker-compose up -d postgres redis

# 方式 B：本地 PostgreSQL
createdb history_dev
psql history_dev -c "CREATE EXTENSION postgis;"
```

#### 初始化后端
```bash
cd backend
npm install
cp .env.example .env  # 配置环境变量
npm run migrate       # 运行数据库迁移
npm run seed         # 导入样例数据
npm run dev          # 启动开发服务器 (localhost:3000)
```

#### 初始化前端
```bash
cd ../frontend
npm install
npm run dev          # 启动开发服务器 (localhost:5173)
```

#### 验证环境
```bash
# 后端 API 健康检查
curl http://localhost:3000/health

# 前端应该可以访问
open http://localhost:5173
```

### 步骤 4：运行测试

```bash
# 后端测试
cd backend
npm test              # 运行所有测试
npm run test:watch   # 监听模式

# 前端测试
cd ../frontend
npm test              # 运行所有测试
npm run test:coverage # 生成覆盖率报告
```

---

## 工作流程

### 1. 选择任务

- 查看 [GitHub Issues](https://github.com) 或 [ROADMAP.md](./ROADMAP.md) 中的待做任务
- 寻找标有 `good-first-issue`（适合新手）或 `help-wanted`（有需要）的任务
- 也可以在 [Discussions](https://github.com) 中提出新想法

### 2. 创建分支

遵循分支命名规范：
```
feature/<feature-name>      # 新功能
fix/<bug-description>       # Bug 修复
docs/<topic>               # 文档更新
data/<dataset-name>        # 数据贡献
refactor/<area>            # 重构
test/<test-subject>        # 测试相关
```

示例：
```bash
git checkout -b feature/add-search-filter
git checkout -b fix/map-loading-issue
git checkout -b data/tang-dynasty-boundaries
```

### 3. 进行开发

- 编写代码、添加测试、更新文档
- 定期提交，每个提交应该是一个独立的、有意义的改动
- 遵循代码风格规范（见下一节）
- 提交前确保测试通过

### 4. 提交 Commit

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 列表**：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建、依赖更新等

**Scope 范围**：
- `frontend`: 前端相关
- `backend`: 后端相关
- `data`: 数据相关
- `ci`: CI/CD 相关
- `docs`: 文档相关

**Subject 主题**：
- 使用英文或中文，简明扼要（50 字以内）
- 使用祈使语态，不要用过去时（如 "add" 而非 "added"）
- 不要首字母大写

**示例**：
```
feat(frontend): add timeline range selector

Allow users to drag timeline to select date range,
filtering events and map data accordingly.

Closes #123
```

```
fix(data): correct Tang dynasty boundary coordinates

Fixed incorrect latitude/longitude values for
eastern province boundaries. Source verified
against CHGIS dataset v6.0.
```

### 5. 提交 Push

```bash
# 更新本地分支
git fetch upstream main

# 如果有冲突，进行 rebase
git rebase upstream/main

# Push 到你的 fork
git push origin feature/your-feature-name
```

---

## 代码风格与规范

### 前端（React + TypeScript）

#### 命名规范
- 组件文件：PascalCase (e.g., `TimelineControl.tsx`)
- 工具函数：camelCase (e.g., `formatDate.ts`)
- 常量：UPPER_SNAKE_CASE (e.g., `const MAX_ZOOM_LEVEL = 20`)
- CSS 类名：kebab-case (e.g., `timeline-container`)

#### Linting & Formatting
```bash
# 自动修复格式问题
npm run lint:fix
npm run format

# 在提交前检查
npm run lint
npm run format:check
```

#### TypeScript 规范
- 尽量使用类型注解，避免 `any`
- 为 props、state、函数参数和返回值添加类型
- 示例：
```typescript
interface TimelineProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (date: Date) => void;
}

const TimelineControl: React.FC<TimelineProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  // implementation
};
```

#### React 最佳实践
- 使用函数式组件与 Hooks
- 避免深层嵌套，使用合理的组件拆分
- 使用 `useCallback`、`useMemo` 优化性能
- 为组件添加 PropTypes 或 TypeScript 检查

### 后端（Node.js / FastAPI）

#### Node.js (TypeScript + Express/NestJS)
- 命名规范：camelCase for variables/functions，PascalCase for classes/types
- 模块组织：`src/` 目录下按 `models/`, `routes/`, `services/`, `utils/` 分层
- 异步处理：使用 async/await，避免回调嵌套
- 错误处理：使用统一的错误响应格式

示例：
```typescript
// route.ts
import { Router } from 'express';
import { EventService } from '../services/event.service';

export const eventRouter = Router();

eventRouter.get('/events/:id', async (req, res, next) => {
  try {
    const event = await EventService.findById(req.params.id);
    res.json({ data: event });
  } catch (error) {
    next(error);
  }
});
```

#### Python (FastAPI)
- 命名规范：snake_case for functions，PascalCase for classes
- 模块组织：`app/` 目录下分 `models/`, `routes/`, `services/`, `utils/`
- 类型提示：为所有函数参数和返回值添加类型注解
- 异常处理：捕获并返回结构化错误信息

示例：
```python
from fastapi import APIRouter, HTTPException
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/{event_id}")
async def get_event(event_id: str) -> dict:
    try:
        event = await EventService.find_by_id(event_id)
        return {"data": event}
    except EventNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
```

### 数据与 SQL

- 使用 ORM（Prisma / SQLAlchemy）而非原始 SQL（特殊查询除外）
- SQL 关键字大写，表名/列名小写
- 为复杂的空间查询添加注释
- GeoJSON 文件格式化（使用 jq 或 Python 的 json.tool）

---

## 提交 Issue

### 何时提交 Issue

- 发现 bug
- 有功能请求
- 文档不清楚或有错误
- 性能问题
- 讨论新想法

### Issue 模板

提交 Issue 时，请使用相应的模板（GitHub 会自动提示）。以下是基本要求：

#### Bug 报告
```markdown
## 问题描述
清晰简洁地描述 bug 是什么。

## 复现步骤
1. 访问 ...
2. 点击 ...
3. 看到 ...

## 预期行为
应该发生什么。

## 实际行为
实际发生了什么。

## 环境信息
- 浏览器/OS: [e.g., Chrome on macOS]
- Node.js 版本: [e.g., 16.13.0]
- 项目版本: [e.g., 0.1.0]

## 附加上下文
截图、日志或其他相关信息。
```

#### 功能请求
```markdown
## 功能描述
简洁描述你想要的功能。

## 使用场景
这个功能解决了什么问题？

## 建议的实现方式
可选的技术建议。

## 相关 Issue
是否有相关的 issue 或讨论。
```

---

## 提交 Pull Request

### 创建 PR

1. 在 GitHub 网页版点击 "New Pull Request"
2. 选择 base 分支（通常是 `main` 或 `develop`）和你的 feature 分支
3. 填写 PR 模板（自动显示）

### PR 模板

```markdown
## 相关 Issue
修复 #123 或关联 #456

## 更改描述
简洁描述你做了什么改动。

## 更改类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 破坏性改动（Breaking change）
- [ ] 文档更新

## 测试
- [ ] 添加了新测试
- [ ] 所有测试都通过
- [ ] 未添加新测试（请说明为什么）

## 数据贡献特有
- [ ] 提供了数据来源与许可信息
- [ ] 验证了数据准确性
- [ ] 附带处理脚本（如 QGIS 项目或 GDAL 命令）

## 检查清单
- [ ] 遵循代码风格规范
- [ ] 更新了相关文档
- [ ] 没有未解决的注释或 TODO
- [ ] 本地测试通过
```

### PR 最佳实践

1. **保持 PR 小而专注**：一个 PR 解决一个问题或实现一个功能
2. **提供清晰的描述**：说明为什么做这个改动，而不仅是做了什么
3. **包含测试**：新功能应配备测试，bug 修复应包含防止回退的测试
4. **更新文档**：如果改变了行为或 API，更新相关文档
5. **保持历史清晰**：定期 rebase 以保持线性的 commit 历史

---

## 代码审查过程

### 审查者职责
- 检查代码质量、逻辑正确性
- 确保测试覆盖充分
- 提供建设性反馈
- 认可代码后会点击 "Approve"

### 提交者职责
- 对反馈做出回应（询问澄清或进行改进）
- 提交改进的代码
- 推送更新后通知审查者重新审查

### 合并条件
- 至少一位维护者 approve
- 所有自动检查（测试、lint）通过
- 无冲突或冲突已解决

### 合并后
- 分支将自动删除
- 感谢贡献者！

---

## 数据贡献指南

### 添加历史事件

**文件位置**: `data/processed/events.geojson` 或 `data/raw/events_*.csv`

**字段要求**:
```json
{
  "type": "Feature",
  "properties": {
    "id": "evt_唐安史之乱",
    "title": "安史之乱",
    "title_en": "An Lushan Rebellion",
    "start_year": 755,
    "start_month": 12,
    "end_year": 763,
    "end_month": 2,
    "description": "唐玄宗统治后期，安禄山、史思明发动的大规模叛乱...",
    "event_type": "war",  // 如 war, diplomacy, culture, disaster
    "participants": ["per_安禄山", "per_史思明", "per_唐玄宗"],
    "locations": ["place_长安", "place_洛阳"],
    "sources": [
      {
        "title": "资治通鉴",
        "author": "司马光",
        "url": "https://...",
        "accessed_date": "2025-01-01"
      }
    ],
    "confidence": 0.95,  // 数据可信度 0-1
    "contributors": ["username1", "username2"]
  },
  "geometry": {
    "type": "Point",
    "coordinates": [104.0658, 34.2658]  // [经度, 纬度]
  }
}
```

### 添加历史人物

**文件位置**: `data/processed/persons.geojson`

**必需字段**:
```json
{
  "type": "Feature",
  "properties": {
    "id": "per_李世民",
    "name": "李世民",
    "name_en": "Li Shimin",
    "birth_year": 598,
    "death_year": 649,
    "biography": "唐太宗，杰出的政治家与军事家...",
    "roles": ["emperor", "military_general", "reformer"],
    "related_events": ["evt_玄武门之变", "evt_唐缅战争"],
    "sources": [...],
    "confidence": 0.98,
    "contributors": [...]
  }
}
```

### 贡献地图边界

**工具**: QGIS（推荐）、GDAL/ogr2ogr

**步骤**:
1. 在 QGIS 中加载历史底图或参考数据
2. 创建新图层，矢量化边界（多边形）
3. 为每个行政单元添加属性：
   - `name`: 行政单元名称
   - `valid_from`: 有效起始年份
   - `valid_to`: 有效结束年份
   - `type`: 行政等级（province, prefecture, county, etc.)
   - `source`: 数据来源
   - `authority`: 参考文献
4. 导出为 GeoJSON：
```bash
ogr2ogr -f GeoJSON output.geojson input.shp
```
5. 验证 GeoJSON 有效性：
```bash
jq empty output.geojson  # jq 应该无输出（表示有效）
```

### 数据质量检查清单

- [ ] 所有必需字段都已填充
- [ ] 坐标系统一致（EPSG:4326）
- [ ] 几何有效（无自交、封闭等）
- [ ] 数据来源清晰可引用
- [ ] 信息经过验证或标注可信度
- [ ] GeoJSON 格式正确（通过 `jq` 验证）
- [ ] 没有敏感或版权问题

---

## 许可与署名

### 代码许可
所有代码贡献遵循 MIT License。提交代码即表示你同意在 MIT 许可下发布。

### 数据许可
所有数据贡献遵循 CC-BY-4.0 License。这意味着：
- 他人可以自由使用、修改和分发你的数据
- 必须明确署名你的贡献
- 任何衍生作品也要遵循相同许可

### 第三方资源
如果你使用了第三方数据（如 CHGIS、OpenStreetMap），请确保：
1. 遵循其原有许可
2. 在提交的 PR 或数据源注释中清晰标注
3. 在 `data/SOURCES.md` 中添加相应的署名和许可信息

**示例**:
```markdown
## 数据来源

### Tang Dynasty Boundaries
- **来源**: CHGIS v6.0 (Harvard, Center for Geographic Analysis)
- **许可**: [CHGIS License](http://www.fas.harvard.edu/~chgis/data/v6/)
- **引用**: 
  ```bibtex
  @dataset{chgis2021,
    title={China Historical GIS, Version 6},
    author={...},
    year={2021},
    url={...}
  }
  ```
- **贡献者**: @username1, @username2
```

---

## 获取帮助

- **技术问题？** 在 [Issues](https://github.com) 或 [Discussions](https://github.com) 中提问
- **不确定如何贡献？** 查看 [ROADMAP.md](./ROADMAP.md) 或在 Discussions 中寻求建议
- **想要实时交流？** 加入我们的 Discord 频道（链接见 README）

---

## 致谢

感谢所有为这个项目做出贡献的人！你们的热情与支持是项目持续发展的动力。

**快乐贡献！** 🎉

---

*最后更新: 2025-12-13*  
*贡献指南版本: 1.0*
