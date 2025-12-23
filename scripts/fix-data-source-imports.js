#!/usr/bin/env node

/**
 * 修复数据源导入问题的脚本
 * 为所有直接导入mock数据的服务创建统一的数据客户端
 */

const fs = require('fs');
const path = require('path');

// 需要处理的服务列表
const services = [
  'tangFigure',
  'sanguoFigure', 
  'qingRuler',
  'yuanFigure',
  'mingFigure',
  'songFigure'
];

// 服务配置映射
const serviceConfigs = {
  tangFigure: {
    typeName: 'TangFigure',
    apiEndpoint: '/tang-figures',
    functions: ['getTangFigures', 'getTangFigureById', 'getRoleTypes', 'getFactions']
  },
  sanguoFigure: {
    typeName: 'SanguoFigure', 
    apiEndpoint: '/sanguo-figures',
    functions: ['getSanguoFigures', 'getSanguoFigureById', 'getRoleTypes', 'getKingdoms']
  },
  qingRuler: {
    typeName: 'QingRuler',
    apiEndpoint: '/qing-rulers', 
    functions: ['getQingRulers', 'getQingRulerById']
  },
  yuanFigure: {
    typeName: 'YuanFigure',
    apiEndpoint: '/yuan-figures',
    functions: ['getYuanFigures', 'getYuanFigureById', 'getRoleTypes', 'getFactions']
  },
  mingFigure: {
    typeName: 'MingFigure',
    apiEndpoint: '/ming-figures', 
    functions: ['getMingFigures', 'getMingFigureById', 'getRoleTypes', 'getFactions']
  },
  songFigure: {
    typeName: 'SongFigure',
    apiEndpoint: '/song-figures',
    functions: ['getSongFigures', 'getSongFigureById', 'getRoleTypes', 'getFactions']
  }
};

function createApiFile(serviceName, config) {
  const { typeName, apiEndpoint, functions } = config;
  
  let content = `import type { ${typeName} } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

`;

  functions.forEach(funcName => {
    if (funcName.includes('getById')) {
      content += `export async function ${funcName}(id: string): Promise<{ data: ${typeName} | null }> {
  try {
    const response = await api.get(\`${apiEndpoint}/\${id}\`);
    const result = handleApiResponse<${typeName}>(response);
    return { data: result.data[0] || null };
  } catch (error) {
    return { data: null };
  }
}

`;
    } else if (funcName.includes('get') && funcName.includes('s')) {
      content += `export async function ${funcName}(): Promise<{ data: ${typeName}[] }> {
  const response = await api.get('${apiEndpoint}');
  return handleApiResponse<${typeName}>(response);
}

`;
    } else {
      // 对于getRoleTypes, getFactions等函数，返回字符串数组
      content += `export function ${funcName}(): string[] {
  // 这个函数需要从API获取数据，暂时返回空数组
  // 在实际实现中，应该调用专门的API端点
  return [];
}

`;
    }
  });

  return content;
}

function createDataClientFile(serviceName, config) {
  const { functions } = config;
  
  let content = `import { createDataFetcher } from '../utils/createDataClient';
import * as ${serviceName}Api from './${serviceName}Api';
import * as ${serviceName}Mock from './${serviceName}Mock';

// 创建统一的数据获取函数
`;

  functions.forEach(funcName => {
    content += `export const ${funcName} = createDataFetcher(
  ${serviceName}Api.${funcName},
  ${serviceName}Mock.${funcName}
);

`;
  });

  return content;
}

function updateServiceFile(serviceName) {
  const servicePath = path.join(__dirname, `../frontend/src/services/${serviceName}/${serviceName}Service.ts`);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`Service file not found: ${servicePath}`);
    return;
  }

  let content = fs.readFileSync(servicePath, 'utf8');
  
  // 替换导入语句
  const oldImport = `import { ${serviceConfigs[serviceName].functions.join(', ')} } from './${serviceName}Mock';`;
  const newImport = `import { ${serviceConfigs[serviceName].functions.join(', ')} } from './${serviceName}DataClient';`;
  
  content = content.replace(oldImport, newImport);
  
  fs.writeFileSync(servicePath, content);
  console.log(`Updated service file: ${servicePath}`);
}

function updateIndexFile(serviceName) {
  const indexPath = path.join(__dirname, `../frontend/src/services/${serviceName}/index.ts`);
  
  if (!fs.existsSync(indexPath)) {
    console.log(`Index file not found: ${indexPath}`);
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');
  
  // 添加新的导出
  if (!content.includes(`export * from './${serviceName}Api';`)) {
    content = content.replace(
      `export * from './${serviceName}Mock';`,
      `export * from './${serviceName}Mock';
export * from './${serviceName}Api';
export * from './${serviceName}DataClient';`
    );
  }
  
  fs.writeFileSync(indexPath, content);
  console.log(`Updated index file: ${indexPath}`);
}

// 主处理函数
function processService(serviceName) {
  console.log(`Processing service: ${serviceName}`);
  
  const config = serviceConfigs[serviceName];
  const serviceDir = path.join(__dirname, `../frontend/src/services/${serviceName}`);
  
  if (!fs.existsSync(serviceDir)) {
    console.log(`Service directory not found: ${serviceDir}`);
    return;
  }

  // 创建API文件
  const apiContent = createApiFile(serviceName, config);
  const apiPath = path.join(serviceDir, `${serviceName}Api.ts`);
  fs.writeFileSync(apiPath, apiContent);
  console.log(`Created API file: ${apiPath}`);

  // 创建数据客户端文件
  const dataClientContent = createDataClientFile(serviceName, config);
  const dataClientPath = path.join(serviceDir, `${serviceName}DataClient.ts`);
  fs.writeFileSync(dataClientPath, dataClientContent);
  console.log(`Created data client file: ${dataClientPath}`);

  // 更新服务文件
  updateServiceFile(serviceName);

  // 更新index文件
  updateIndexFile(serviceName);
}

// 处理所有服务
console.log('开始修复数据源导入问题...');

services.forEach(processService);

console.log('✅ 数据源导入问题修复完成！');
console.log('');
console.log('现在所有服务都会根据 DATA_SOURCE_MODE 配置自动选择数据源：');
console.log('- DATA_SOURCE_MODE = 0: 使用Mock数据');
console.log('- DATA_SOURCE_MODE = 1: 使用API数据');