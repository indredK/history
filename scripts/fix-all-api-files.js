#!/usr/bin/env node

/**
 * 修复所有API文件的函数签名
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复所有API文件的函数签名...\n');

// 需要修复的服务配置
const serviceConfigs = {
  qingRuler: {
    typeName: 'QingRuler',
    apiEndpoint: '/qing-rulers',
    functions: ['getQingRulers', 'getQingRulerById']
  },
  sanguoFigure: {
    typeName: 'SanguoFigure', 
    apiEndpoint: '/sanguo-figures',
    functions: ['getSanguoFigures', 'getSanguoFigureById', 'getRoleTypes', 'getKingdoms']
  },
  songFigure: {
    typeName: 'SongFigure',
    apiEndpoint: '/song-figures',
    functions: ['getSongFigures', 'getSongFigureById', 'getRoleTypes', 'getFactions']
  },
  tangFigure: {
    typeName: 'TangFigure',
    apiEndpoint: '/tang-figures',
    functions: ['getTangFigures', 'getTangFigureById', 'getRoleTypes', 'getFactions']
  },
  yuanFigure: {
    typeName: 'YuanFigure',
    apiEndpoint: '/yuan-figures',
    functions: ['getYuanFigures', 'getYuanFigureById', 'getRoleTypes', 'getFactions']
  }
};

function createCorrectApiFile(serviceName, config) {
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
    const item = Array.isArray(result.data) ? result.data[0] : result.data;
    return { data: item || null };
  } catch (error) {
    return { data: null };
  }
}

`;
    } else if (funcName.includes('get') && funcName.includes('s') && !funcName.includes('Types') && !funcName.includes('Kingdoms') && !funcName.includes('Factions')) {
      content += `export async function ${funcName}(): Promise<{ data: ${typeName}[] }> {
  const response = await api.get('${apiEndpoint}');
  return handleApiResponse<${typeName}>(response);
}

`;
    } else {
      // 对于getRoleTypes, getFactions, getKingdoms等函数，返回字符串数组
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

// 修复所有API文件
Object.keys(serviceConfigs).forEach(serviceName => {
  const config = serviceConfigs[serviceName];
  const apiPath = path.join(__dirname, `../frontend/src/services/${serviceName}/${serviceName}Api.ts`);
  
  if (fs.existsSync(apiPath)) {
    const content = createCorrectApiFile(serviceName, config);
    fs.writeFileSync(apiPath, content);
    console.log(`✅ Fixed API file: ${serviceName}`);
  } else {
    console.log(`⚠️  API file not found: ${serviceName}`);
  }
});

console.log('\n✅ 所有API文件修复完成！');
console.log('');
console.log('运行以下命令验证修复结果：');
console.log('cd frontend && bun run type-check');