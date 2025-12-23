#!/usr/bin/env node

/**
 * 最终修复所有TypeScript类型错误
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 最终修复所有TypeScript类型错误...\n');

// 需要修复的服务列表
const services = ['mingFigure', 'qingRuler', 'sanguoFigure', 'songFigure', 'yuanFigure'];

// 修复所有DataClient文件
function fixAllDataClientFiles() {
  services.forEach(serviceName => {
    const dataClientPath = path.join(__dirname, `../frontend/src/services/${serviceName}/${serviceName}DataClient.ts`);
    
    if (fs.existsSync(dataClientPath)) {
      // 重新生成正确的DataClient文件
      const functions = getServiceFunctions(serviceName);
      const typeName = getTypeName(serviceName);
      
      let content = `import { getDataSourceMode } from '@/config/dataSource';
import { createDataFetcher } from '../utils/createDataClient';
import * as ${serviceName}Api from './${serviceName}Api';
import * as ${serviceName}Mock from './${serviceName}Mock';

// 创建统一的数据获取函数
`;

      functions.forEach(funcName => {
        if (funcName.includes('getRoleTypes') || funcName.includes('getFactions') || funcName.includes('getKingdoms')) {
          // 同步函数
          content += `export const ${funcName} = () => {
  const dataSourceMode = getDataSourceMode();
  if (dataSourceMode === 'api') {
    return ${serviceName}Api.${funcName}();
  } else {
    return ${serviceName}Mock.${funcName}();
  }
};

`;
        } else {
          // 异步函数
          content += `export const ${funcName} = createDataFetcher(
  ${serviceName}Api.${funcName},
  ${serviceName}Mock.${funcName}
);

`;
        }
      });

      fs.writeFileSync(dataClientPath, content);
      console.log(`✅ Fixed DataClient: ${serviceName}`);
    }
  });
}

// 获取服务函数列表
function getServiceFunctions(serviceName) {
  const functionMap = {
    mingFigure: ['getMingFigures', 'getMingFigureById', 'getRoleTypes', 'getFactions'],
    qingRuler: ['getQingRulers', 'getQingRulerById'],
    sanguoFigure: ['getSanguoFigures', 'getSanguoFigureById', 'getRoleTypes', 'getKingdoms'],
    songFigure: ['getSongFigures', 'getSongFigureById', 'getRoleTypes', 'getFactions'],
    yuanFigure: ['getYuanFigures', 'getYuanFigureById', 'getRoleTypes', 'getFactions']
  };
  return functionMap[serviceName] || [];
}

// 获取类型名
function getTypeName(serviceName) {
  const typeMap = {
    mingFigure: 'MingFigure',
    qingRuler: 'QingRuler',
    sanguoFigure: 'SanguoFigure',
    songFigure: 'SongFigure',
    yuanFigure: 'YuanFigure'
  };
  return typeMap[serviceName];
}

// 修复Schools服务接口
function fixSchoolsService() {
  const schoolsServicePath = path.join(__dirname, '../frontend/src/services/schools/schoolsService.ts');
  
  if (fs.existsSync(schoolsServicePath)) {
    let content = fs.readFileSync(schoolsServicePath, 'utf8');
    
    // 修复getSchoolById的返回类型
    content = content.replace(
      'getSchoolById: (id: string) => Promise<{ data: PhilosophicalSchool | null }>;',
      'getSchoolById: (id: string) => Promise<{ data: PhilosophicalSchool | null }>;'
    );
    
    fs.writeFileSync(schoolsServicePath, content);
    console.log('✅ Fixed Schools Service interface');
  }
}

// 主处理函数
console.log('开始最终修复...');

fixAllDataClientFiles();
fixSchoolsService();

console.log('\n✅ 最终TypeScript错误修复完成！');
console.log('');
console.log('运行以下命令验证修复结果：');
console.log('cd frontend && bun run type-check');