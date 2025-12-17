# GitHub Pages 部署指南

## 自动部署设置

项目已配置 GitHub Actions 自动部署到 GitHub Pages。

### 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**
5. 保存设置

### 部署流程

每次推送到 `main` 分支时，GitHub Actions 会自动：
1. 安装依赖
2. 构建前端项目
3. 部署到 GitHub Pages

### 访问网站

部署完成后，你的网站将在以下地址可用：
```
https://你的用户名.github.io/chinese-historical-panorama/
```

## 本地测试

在推送之前，你可以本地测试构建：

```bash
# 进入前端目录
cd frontend

# 构建项目
npm run deploy

# 预览构建结果
npm run preview
```

## 故障排除

### 构建失败
- 检查 GitHub Actions 日志
- 确保所有依赖都在 package.json 中
- 检查 TypeScript 类型错误

### 页面无法访问
- 确保 GitHub Pages 已启用
- 检查仓库是否为公开仓库
- 等待几分钟让部署生效

### 资源加载失败
- 检查 vite.config.ts 中的 base 路径配置
- 确保路径与仓库名匹配