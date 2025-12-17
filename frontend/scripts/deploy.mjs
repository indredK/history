#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 开始构建项目...');

try {
  // 设置生产环境
  process.env.NODE_ENV = 'production';
  
  // 构建项目
  execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
  
  console.log('✅ 构建完成！');
  console.log('📁 构建文件位于: ./dist');
  
  if (existsSync('./dist/index.html')) {
    console.log('🎉 构建成功！你可以：');
    console.log('1. 推送代码到 GitHub，GitHub Actions 会自动部署');
    console.log('2. 或者运行 npm run preview 本地预览构建结果');
  }
  
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}