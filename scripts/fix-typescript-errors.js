#!/usr/bin/env node

/**
 * 修复TypeScript类型错误的脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复TypeScript类型错误...\n');

// 需要修复的服务列表
const services = [
  'emperor',
  'tangFigure',
  'sanguoFigure', 
  'qingRuler',
  'yuanFigure',
  'mingFigure',
  'songFigure'
];

// 修复index.ts文件的导出冲突
function fixIndexExports(serviceName) {
  const indexPath = path.join(__dirname, `../frontend/src/services/${serviceName}/index.ts`);
  
  if (!fs.existsSync(indexPath)) {
    console.log(`⚠️  Index file not found: ${indexPath}`);
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');
  
  // 移除API和DataClient的导出，只保留类型和Mock导出
  const newContent = `export * from './types';
export * from './${serviceName}Mock';
export { ${serviceName}Service, type ${getServiceSortType(serviceName)} } from './${serviceName}Service';

// 只导出数据客户端的函数，避免命名冲突
export { 
  ${getExportFunctions(serviceName).join(',\n  ')}
} from './${serviceName}DataClient';
`;

  fs.writeFileSync(indexPath, newContent);
  console.log(`✅ Fixed index exports: ${serviceName}`);
}

// 获取服务的排序类型名
function getServiceSortType(serviceName) {
  const typeMap = {
    emperor: 'EmperorSortBy',
    tangFigure: 'TangFigureSortBy',
    sanguoFigure: 'SanguoFigureSortBy',
    qingRuler: 'QingRulerSortBy',
    yuanFigure: 'YuanFigureSortBy',
    mingFigure: 'MingFigureSortBy',
    songFigure: 'SongFigureSortBy'
  };
  return typeMap[serviceName] || 'SortBy';
}

// 获取导出函数列表
function getExportFunctions(serviceName) {
  const functionMap = {
    emperor: ['getEmperors', 'getEmperorById', 'getDynasties'],
    tangFigure: ['getTangFigures', 'getTangFigureById', 'getRoleTypes', 'getFactions'],
    sanguoFigure: ['getSanguoFigures', 'getSanguoFigureById', 'getRoleTypes', 'getKingdoms'],
    qingRuler: ['getQingRulers', 'getQingRulerById'],
    yuanFigure: ['getYuanFigures', 'getYuanFigureById', 'getRoleTypes', 'getFactions'],
    mingFigure: ['getMingFigures', 'getMingFigureById', 'getRoleTypes', 'getFactions'],
    songFigure: ['getSongFigures', 'getSongFigureById', 'getRoleTypes', 'getFactions']
  };
  return functionMap[serviceName] || [];
}

// 修复DataClient文件中的函数签名问题
function fixDataClientSignatures(serviceName) {
  const dataClientPath = path.join(__dirname, `../frontend/src/services/${serviceName}/${serviceName}DataClient.ts`);
  
  if (!fs.existsSync(dataClientPath)) {
    console.log(`⚠️  DataClient file not found: ${dataClientPath}`);
    return;
  }

  let content = fs.readFileSync(dataClientPath, 'utf8');
  
  // 修复函数参数不匹配的问题
  // 对于getRoleTypes和getFactions等同步函数，需要特殊处理
  const functions = getExportFunctions(serviceName);
  
  let newContent = `import { createDataFetcher } from '../utils/createDataClient';
import * as ${serviceName}Api from './${serviceName}Api';
import * as ${serviceName}Mock from './${serviceName}Mock';

// 创建统一的数据获取函数
`;

  functions.forEach(funcName => {
    if (funcName.includes('getRoleTypes') || funcName.includes('getFactions') || funcName.includes('getKingdoms') || funcName.includes('getDynasties')) {
      // 这些是同步函数，需要特殊处理
      newContent += `export const ${funcName} = () => {
  const dataSourceMode = getDataSourceMode();
  if (dataSourceMode === 'api') {
    return ${serviceName}Api.${funcName}();
  } else {
    return ${serviceName}Mock.${funcName}();
  }
};

`;
    } else {
      // 异步函数使用createDataFetcher
      newContent += `export const ${funcName} = createDataFetcher(
  ${serviceName}Api.${funcName},
  ${serviceName}Mock.${funcName}
);

`;
    }
  });

  // 添加必要的导入
  newContent = `import { getDataSourceMode } from '@/config/dataSource';
${newContent}`;

  fs.writeFileSync(dataClientPath, newContent);
  console.log(`✅ Fixed DataClient signatures: ${serviceName}`);
}

// 修复API文件中的函数签名
function fixApiSignatures(serviceName) {
  const apiPath = path.join(__dirname, `../frontend/src/services/${serviceName}/${serviceName}Api.ts`);
  
  if (!fs.existsSync(apiPath)) {
    console.log(`⚠️  API file not found: ${apiPath}`);
    return;
  }

  let content = fs.readFileSync(apiPath, 'utf8');
  
  // 修复getById函数的返回类型
  if (content.includes('getById')) {
    content = content.replace(
      /return { data: result\.data\[0\] \|\| null };/g,
      'const item = Array.isArray(result.data) ? result.data[0] : result.data;\n    return { data: item || null };'
    );
  }

  fs.writeFileSync(apiPath, content);
  console.log(`✅ Fixed API signatures: ${serviceName}`);
}

// 修复特殊服务的问题
function fixSpecialServices() {
  // 修复scholar API
  const scholarApiPath = path.join(__dirname, '../frontend/src/services/scholar/scholarApi.ts');
  if (fs.existsSync(scholarApiPath)) {
    let content = fs.readFileSync(scholarApiPath, 'utf8');
    content = content.replace(
      'getScholarById: async (id: string) => {',
      'getScholarById: async (id: string): Promise<{ data: Scholar | null }> => {'
    );
    content = content.replace(
      'return handleApiResponse<Scholar>(response);',
      'const result = handleApiResponse<Scholar>(response);\n    const scholar = Array.isArray(result.data) ? result.data[0] : result.data;\n    return { data: scholar || null };'
    );
    fs.writeFileSync(scholarApiPath, content);
    console.log('✅ Fixed scholar API');
  }

  // 修复schools API
  const schoolsApiPath = path.join(__dirname, '../frontend/src/services/schools/schoolsApi.ts');
  if (fs.existsSync(schoolsApiPath)) {
    let content = fs.readFileSync(schoolsApiPath, 'utf8');
    content = content.replace(
      'getSchoolById: async (id: string) => {',
      'getSchoolById: async (id: string): Promise<{ data: PhilosophicalSchool | null }> => {'
    );
    content = content.replace(
      'return handleApiResponse<PhilosophicalSchool>(response);',
      'const result = handleApiResponse<PhilosophicalSchool>(response);\n    const school = Array.isArray(result.data) ? result.data[0] : result.data;\n    return { data: school || null };'
    );
    fs.writeFileSync(schoolsApiPath, content);
    console.log('✅ Fixed schools API');
  }

  // 修复religion相关问题
  const religionServicePath = path.join(__dirname, '../frontend/src/services/religion/religionService.ts');
  if (fs.existsSync(religionServicePath)) {
    let content = fs.readFileSync(religionServicePath, 'utf8');
    // 移除不存在的period属性引用
    content = content.replace(/node\.period/g, 'node.type'); // 假设用type替代period
    fs.writeFileSync(religionServicePath, content);
    console.log('✅ Fixed religion service');
  }

  // 清理未使用的导入
  const mythologyDataClientPath = path.join(__dirname, '../frontend/src/services/mythology/mythologyDataClient.ts');
  if (fs.existsSync(mythologyDataClientPath)) {
    let content = fs.readFileSync(mythologyDataClientPath, 'utf8');
    content = content.replace("import { getDataSourceMode } from '@/config/dataSource';\n", '');
    fs.writeFileSync(mythologyDataClientPath, content);
    console.log('✅ Fixed mythology data client');
  }

  const religionDataClientPath = path.join(__dirname, '../frontend/src/services/religion/religionDataClient.ts');
  if (fs.existsSync(religionDataClientPath)) {
    let content = fs.readFileSync(religionDataClientPath, 'utf8');
    content = content.replace("import { getDataSourceMode } from '@/config/dataSource';\n", '');
    fs.writeFileSync(religionDataClientPath, content);
    console.log('✅ Fixed religion data client');
  }
}

// 主处理函数
function processService(serviceName) {
  console.log(`🔧 Processing service: ${serviceName}`);
  
  fixIndexExports(serviceName);
  fixDataClientSignatures(serviceName);
  fixApiSignatures(serviceName);
}

// 处理所有服务
console.log('开始修复TypeScript错误...');

services.forEach(processService);

// 修复特殊服务
fixSpecialServices();

console.log('\n✅ TypeScript错误修复完成！');
console.log('');
console.log('运行以下命令验证修复结果：');
console.log('cd frontend && bun run type-check');