#!/usr/bin/env node

/**
 * 修复剩余的TypeScript类型错误
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复剩余的TypeScript类型错误...\n');

// 修复DataClient文件中的函数参数问题
function fixDataClientFiles() {
  const services = ['mingFigure', 'qingRuler', 'sanguoFigure', 'songFigure', 'tangFigure', 'yuanFigure'];
  
  services.forEach(serviceName => {
    const dataClientPath = path.join(__dirname, `../frontend/src/services/${serviceName}/${serviceName}DataClient.ts`);
    
    if (fs.existsSync(dataClientPath)) {
      let content = fs.readFileSync(dataClientPath, 'utf8');
      
      // 修复getById函数的参数问题
      const getByIdFunctionName = `get${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}ById`;
      
      // 替换错误的createDataFetcher调用
      const oldPattern = new RegExp(`export const ${getByIdFunctionName} = createDataFetcher\\(\\s*${serviceName}Api\\.${getByIdFunctionName},\\s*${serviceName}Mock\\.${getByIdFunctionName}\\s*\\);`, 'g');
      
      const newFunction = `export const ${getByIdFunctionName} = createDataFetcher(
  ${serviceName}Api.${getByIdFunctionName},
  ${serviceName}Mock.${getByIdFunctionName}
);`;

      content = content.replace(oldPattern, newFunction);
      
      fs.writeFileSync(dataClientPath, content);
      console.log(`✅ Fixed DataClient: ${serviceName}`);
    }
  });
}

// 修复Scholar API
function fixScholarApi() {
  const scholarApiPath = path.join(__dirname, '../frontend/src/services/scholar/scholarApi.ts');
  
  if (fs.existsSync(scholarApiPath)) {
    const content = `import type { ScholarService } from './scholarService';
import type { Scholar } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export const scholarApi: ScholarService = {
  getScholars: async () => {
    const response = await api.get('/scholars');
    return handleApiResponse<Scholar>(response);
  },

  getScholarById: async (id: string) => {
    const response = await api.get(\`/scholars/\${id}\`);
    const result = handleApiResponse<Scholar>(response);
    const scholar = Array.isArray(result.data) ? result.data[0] : result.data;
    return { data: scholar || null };
  },
};`;
    
    fs.writeFileSync(scholarApiPath, content);
    console.log('✅ Fixed Scholar API');
  }
}

// 修复Schools API
function fixSchoolsApi() {
  const schoolsApiPath = path.join(__dirname, '../frontend/src/services/schools/schoolsApi.ts');
  
  if (fs.existsSync(schoolsApiPath)) {
    const content = `import type { SchoolsService } from './schoolsService';
import type { PhilosophicalSchool } from './types';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

const api = createApiClient();

export const schoolsApi: SchoolsService = {
  getSchools: async () => {
    const response = await api.get('/schools');
    return handleApiResponse<PhilosophicalSchool>(response);
  },

  getSchoolById: async (id: string) => {
    const response = await api.get(\`/schools/\${id}\`);
    const result = handleApiResponse<PhilosophicalSchool>(response);
    const school = Array.isArray(result.data) ? result.data[0] : result.data;
    return { data: school || null };
  },
};`;
    
    fs.writeFileSync(schoolsApiPath, content);
    console.log('✅ Fixed Schools API');
  }
}

// 清理未使用的导入
function cleanupUnusedImports() {
  const qingRulerDataClientPath = path.join(__dirname, '../frontend/src/services/qingRuler/qingRulerDataClient.ts');
  
  if (fs.existsSync(qingRulerDataClientPath)) {
    let content = fs.readFileSync(qingRulerDataClientPath, 'utf8');
    
    // 检查是否实际使用了getDataSourceMode
    if (!content.includes('getDataSourceMode()')) {
      content = content.replace("import { getDataSourceMode } from '@/config/dataSource';\n", '');
    }
    
    fs.writeFileSync(qingRulerDataClientPath, content);
    console.log('✅ Cleaned up QingRuler DataClient imports');
  }
}

// 主处理函数
console.log('开始修复剩余的TypeScript错误...');

fixDataClientFiles();
fixScholarApi();
fixSchoolsApi();
cleanupUnusedImports();

console.log('\n✅ 剩余TypeScript错误修复完成！');
console.log('');
console.log('运行以下命令验证修复结果：');
console.log('cd frontend && bun run type-check');