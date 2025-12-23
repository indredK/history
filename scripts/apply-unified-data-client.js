#!/usr/bin/env node

/**
 * 应用统一数据客户端的脚本
 * 自动更新所有DataClient文件，使用统一的错误处理配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 应用统一数据客户端配置...\n');

// 需要更新的服务列表
const services = [
  'tangFigure',
  'sanguoFigure', 
  'songFigure',
  'mingFigure',
  'yuanFigure',
  'qingRuler',
  'emperor',
  'scholar',
  'schools'
];

/**
 * 生成统一的DataClient文件内容
 */
function generateUnifiedDataClientContent(serviceName) {
  const capitalizedName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  
  return `/**
 * ${capitalizedName} 统一数据客户端
 * 使用统一的错误处理、重试和降级策略
 * 
 * 🎯 统一配置：所有错误处理逻辑都在 unifiedDataClient.ts 中统一管理
 * 📝 无需修改：此文件使用统一配置，无需单独修改错误处理逻辑
 */

import { createServiceDataClient } from '../utils/unifiedDataClient';
import * as ${serviceName}Api from './${serviceName}Api';
import * as ${serviceName}Mock from './${serviceName}Mock';

// 🎯 使用统一数据客户端创建服务
// 所有的错误处理、重试、熔断、降级策略都在统一配置中处理
const unifiedService = createServiceDataClient(
  '${serviceName}',
  ${serviceName}Api,
  ${serviceName}Mock
);

// 导出所有函数
export const {
${getExportFunctions(serviceName).map(func => `  ${func}`).join(',\n')}
} = unifiedService;

/**
 * 🔧 配置说明：
 * 
 * 1. 错误处理：统一在 unifiedDataClient.ts 中配置
 * 2. 重试策略：最多3次，指数退避
 * 3. 熔断保护：连续5次失败后熔断30秒
 * 4. 自动降级：连续3次失败后切换到Mock数据
 * 5. 智能恢复：API恢复后自动切换回真实数据
 * 
 * 如需调整配置，请修改：
 * - frontend/src/services/utils/unifiedDataClient.ts (统一配置)
 * - frontend/src/services/utils/fallbackManager.ts (降级策略)
 * - frontend/src/services/utils/enhancedApiClient.ts (重试和熔断)
 */
`;
}

/**
 * 获取服务的导出函数列表
 */
function getExportFunctions(serviceName) {
  const functionMap = {
    tangFigure: ['getTangFigures', 'getTangFigureById', 'getRoleTypes', 'getFactions'],
    sanguoFigure: ['getSanguoFigures', 'getSanguoFigureById', 'getRoleTypes', 'getKingdoms'],
    songFigure: ['getSongFigures', 'getSongFigureById', 'getRoleTypes', 'getFactions'],
    mingFigure: ['getMingFigures', 'getMingFigureById', 'getRoleTypes', 'getFactions'],
    yuanFigure: ['getYuanFigures', 'getYuanFigureById', 'getRoleTypes', 'getFactions'],
    qingRuler: ['getQingRulers', 'getQingRulerById'],
    emperor: ['getEmperors', 'getEmperorById', 'getDynasties'],
    scholar: ['getScholars', 'getScholarById'],
    schools: ['getSchools', 'getSchoolById']
  };
  return functionMap[serviceName] || [];
}

/**
 * 更新单个服务的DataClient文件
 */
function updateServiceDataClient(serviceName) {
  const dataClientPath = path.join(__dirname, `../frontend/src/services/${serviceName}/${serviceName}DataClient.ts`);
  
  if (!fs.existsSync(dataClientPath)) {
    console.log(`⚠️  DataClient文件不存在: ${serviceName}`);
    return;
  }

  const content = generateUnifiedDataClientContent(serviceName);
  fs.writeFileSync(dataClientPath, content);
  console.log(`✅ 已更新: ${serviceName}DataClient.ts`);
}

/**
 * 创建全局配置文件的说明
 */
function createConfigurationGuide() {
  const guidePath = path.join(__dirname, '../UNIFIED_ERROR_HANDLING_GUIDE.md');
  
  const content = `# 统一错误处理配置指南

## 🎯 统一配置的优势

现在所有的API错误处理都通过统一配置管理，你只需要在一个地方修改配置，就能影响所有服务：

### ✅ 优点
- **统一管理**：所有错误处理逻辑在一个地方配置
- **无需重复**：每个DataClient文件无需单独修改
- **配置简单**：修改一次配置，影响所有服务
- **维护方便**：只需要维护统一的配置文件

### ❌ 之前的问题
- 每个DataClient文件都需要单独修改
- 配置分散，难以维护
- 容易遗漏某些文件
- 配置不一致

## 🔧 配置文件位置

### 主要配置文件
1. **\`frontend/src/services/utils/unifiedDataClient.ts\`**
   - 统一数据客户端
   - 服务配置
   - 全局错误处理配置

2. **\`frontend/src/services/utils/fallbackManager.ts\`**
   - 降级策略配置
   - 自动降级逻辑

3. **\`frontend/src/services/utils/enhancedApiClient.ts\`**
   - 重试机制配置
   - 熔断器配置

### DataClient文件
所有的 \`*DataClient.ts\` 文件现在都使用统一配置，**无需单独修改**。

## ⚙️ 如何修改配置

### 1. 修改全局错误处理配置
\`\`\`typescript
// frontend/src/services/utils/unifiedDataClient.ts
export const GLOBAL_ERROR_CONFIG = {
  retry: {
    maxRetries: 3,        // 修改最大重试次数
    retryDelay: 1000,     // 修改重试延迟
  },
  
  circuitBreaker: {
    failureThreshold: 5,  // 修改熔断阈值
    recoveryTimeout: 30000, // 修改恢复时间
  },
  
  fallback: {
    enableAutoFallback: true,    // 启用/禁用自动降级
    fallbackThreshold: 3,        // 修改降级阈值
    fallbackDuration: 300000,    // 修改降级持续时间
  }
};
\`\`\`

### 2. 添加新服务配置
\`\`\`typescript
// frontend/src/services/utils/unifiedDataClient.ts
export const SERVICE_CONFIGS = {
  // 添加新服务
  newService: {
    serviceName: '新服务',
    asyncFunctions: ['getNewData', 'getNewDataById'],
    syncFunctions: ['getNewTypes']
  }
};
\`\`\`

### 3. 运行时修改配置
\`\`\`typescript
import { updateGlobalErrorConfig } from '@/services/utils/unifiedDataClient';

// 动态修改配置
updateGlobalErrorConfig({
  retry: { maxRetries: 5 },
  fallback: { fallbackThreshold: 2 }
});
\`\`\`

## 📊 配置效果

### 重试策略
- **默认**：最多重试3次，指数退避 (1s, 2s, 4s)
- **条件**：只对网络错误和5xx错误重试
- **超时**：10秒请求超时

### 熔断器保护
- **阈值**：连续5次失败后熔断
- **时间**：熔断30秒后尝试恢复
- **恢复**：连续3次成功后完全恢复

### 自动降级
- **阈值**：连续3次失败后自动降级
- **目标**：切换到Mock数据
- **时间**：5分钟后尝试恢复API
- **恢复**：API正常后自动切换回来

## 🎯 使用示例

### 现在的使用方式（推荐）
\`\`\`typescript
// 所有DataClient文件都使用统一配置
import { getTangFigures } from '@/services/tangFigure';

// 自动包含所有错误处理逻辑
const data = await getTangFigures();
\`\`\`

### 之前的使用方式（已废弃）
\`\`\`typescript
// 每个文件都需要单独配置错误处理
export const getTangFigures = () => {
  const dataSourceMode = getDataSourceMode();
  if (dataSourceMode === 'api') {
    return executeWithFallback(
      () => tangFigureApi.getTangFigures(),
      () => tangFigureMock.getTangFigures(),
      '获取唐朝人物列表'
    );
  } else {
    return tangFigureMock.getTangFigures();
  }
};
\`\`\`

## 🚀 总结

现在你只需要：
1. **修改一个配置文件** - \`unifiedDataClient.ts\`
2. **影响所有服务** - 自动应用到所有DataClient
3. **无需重复工作** - 不用修改每个DataClient文件
4. **配置更简单** - 统一的配置接口

这就是真正的"统一配置"！🎉
`;

  fs.writeFileSync(guidePath, content);
  console.log('✅ 已创建配置指南: UNIFIED_ERROR_HANDLING_GUIDE.md');
}

// 主处理流程
console.log('开始应用统一数据客户端配置...');

// 更新所有服务的DataClient文件
services.forEach(updateServiceDataClient);

// 创建配置指南
createConfigurationGuide();

console.log('\n🎉 统一数据客户端配置应用完成！');
console.log('');
console.log('📋 总结：');
console.log(`✅ 已更新 ${services.length} 个DataClient文件`);
console.log('✅ 所有服务现在使用统一的错误处理配置');
console.log('✅ 无需单独修改每个DataClient文件');
console.log('');
console.log('🔧 配置文件位置：');
console.log('- frontend/src/services/utils/unifiedDataClient.ts (主配置)');
console.log('- frontend/src/services/utils/fallbackManager.ts (降级策略)');
console.log('- frontend/src/services/utils/enhancedApiClient.ts (重试和熔断)');
console.log('');
console.log('📖 详细说明请查看: UNIFIED_ERROR_HANDLING_GUIDE.md');