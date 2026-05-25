# 安全政策 (Security Policy)

## 报告安全漏洞

如果你发现了项目中的安全漏洞,**请勿**在公开的 Issue 或 Discussion 中披露。这可能会让恶意用户利用该漏洞。

### 安全报告流程

1. **发送私密邮件**到: `security@example.com`(建设中)

2. **在邮件中包括**:
   - 漏洞的清晰描述
   - 漏洞的位置(文件、代码行等)
   - 潜在的影响范围
   - 复现步骤(如果适用)
   - 建议的修复方案(可选)

3. **预期回应时间**:
   - 初步确认: 48 小时内
   - 详细回复: 7 天内
   - 修复与发布: 30 天内(或根据严重程度加急)

### 漏洞严重程度分类

| 等级 | 描述 | 处理时间 |
|------|------|--------|
| **Critical** | 可导致数据泄露、系统崩溃或被完全控制 | 24 小时内发布补丁 |
| **High** | 可导致重要功能失效或未授权访问 | 7 天内发布补丁 |
| **Medium** | 可导致部分功能异常或信息泄露 | 14 天内发布补丁 |
| **Low** | 不影响系统正常运行,信息披露有限 | 下个版本发布时修复 |

## 安全团队

项目的安全团队成员将负责:
- 验证漏洞报告的真实性
- 开发修复方案
- 协调与社区的沟通
- 发布安全更新与公告

## 安全责任声明

### 我们的承诺

- 重视安全,将其作为持续改进的一部分
- 快速响应与修复已知漏洞
- 定期进行安全审查与更新依赖
- 透明地沟通安全问题(修复后)

### 用户的责任

- 及时更新到最新版本
- 按照部署指南安全配置应用
- 为敏感数据(如数据库密码)使用强加密
- 定期备份关键数据

## 安全特性

### 已实现

- ✅ **输入验证与输出转义**:全局 `ValidationPipe` + `class-validator`,防止 XSS
- ✅ **SQL 参数化查询**:Prisma ORM 自带,防止 SQL 注入
- ✅ **CORS 配置限制跨域请求**:由 `CORS_ORIGIN` 环境变量控制
- ✅ **环境变量管理**:`.env` 文件(`.gitignore` 中已排除敏感信息)
- ✅ **前端路由级错误边界**:`ErrorBoundary` 包裹所有路由(commit `178f9af`)
- ✅ **HTTP 客户端错误分类**:axios 拦截器统一处理 `network` / `timeout` / `server` / `client` / `auth`,5xx/timeout/network 自动重试 2 次(commit `178f9af`)
- ✅ **Swagger Bearer 认证方案**:`DocumentBuilder` 已注册 `JWT-auth`,Controller 加 `@ApiBearerAuth('JWT-auth')` 即可对接(commit `94eb489`)

### 待实现(后续版本)

- ⏳ **HTTPS/TLS 加密传输**(生产环境配置,反向代理 Nginx/Caddy)
- ⏳ **用户身份认证**:JWT 或 OAuth 2.0,Guard / `@Public()` / `@Roles()` 体系
- ⏳ **数据库连接加密**:迁移到 PostgreSQL 后启用 SSL 连接
- ⏳ **速率限制与 DDoS 防护**:`@nestjs/throttler`
- ⏳ **helmet 安全头中间件**:CSP / X-Frame-Options / HSTS 等
- ⏳ **pino 结构化日志 + 安全审计追踪**:登录、权限变更、敏感操作记录
- ⏳ **Dependabot 自动依赖更新**:`.github/dependabot.yml`
- ⏳ **pre-commit secret scanning**:husky + gitleaks(防止密钥误提交)
- ⏳ **定期安全审计**:`bun audit` / `npm audit` 接入 CI

## 安全最佳实践

### 开发者

- 不在代码或配置文件中存储密钥、密码或 API Token
- 使用 `.env` 文件管理敏感配置(`.gitignore` 中排除)
- 定期运行依赖安全检查: `bun audit` 或 `npm audit`
- 对用户输入进行验证与清理(已通过 `ValidationPipe` 全局覆盖)
- 记录安全相关的事件(登录、权限变更等)

### 部署者

- 使用 HTTPS/TLS 证书(Let's Encrypt 等)
- 启用防火墙和入侵检测系统
- 定期备份数据库
- 限制数据库访问权限(最小权限原则)
- 使用强密码并启用 MFA(如适用)
- 定期更新操作系统与依赖

## 已知问题

| 类别 | 说明 | 跟踪位置 |
|---|---|---|
| 认证缺失 | 所有 Controller 当前为 public,无 JWT 验证 | ARCHITECTURE_ISSUES.md §1.1 |
| 速率限制 | 后端未接入 throttler,易被刷接口 | ARCHITECTURE_ISSUES.md §6.4 |
| 安全头 | 后端未接入 helmet | ARCHITECTURE_ISSUES.md §6.4 |
| 审计日志 | 无结构化日志,排查困难 | ARCHITECTURE_ISSUES.md §1.7 |

详细修复计划见 [ROADMAP.md](./ROADMAP.md) M2 后端能力补强。

## 安全相关的更新

本项目遵循以下安全政策:

- **依赖更新**:计划通过 GitHub Dependabot 自动检查与创建 PR(尚未配置)
- **版本发布**:修复的漏洞会在补丁版本中发布(如 1.2.1)
- **公告**:严重漏洞将通过 GitHub Security Advisory 公布

订阅项目的 Release 通知以获得安全更新。

## 相关资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web 应用安全最佳实践
- [CWE Top 25](https://cwe.mitre.org/top25/) - 最常见的软件薄弱点
- [SANS Top 25](https://www.sans.org/top25-software-errors/) - 软件安全风险
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

## 反馈与建议

如果你对本安全政策有建议或改进意见(非漏洞报告),欢迎在 GitHub Discussions 中讨论或联系维护者。

---

**感谢你帮助我们保护用户和社区!** 🛡️

---

*最后更新: 2026-05-26*
*版本: 1.1*
