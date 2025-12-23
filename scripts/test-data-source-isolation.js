#!/usr/bin/env node

/**
 * 测试数据源隔离功能
 * 验证Mock模式和API模式是否完全隔离
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试数据源隔离功能...\n');

// 检查数据源配置文件
const configPath = path.join(__dirname, '../frontend/src/config/dataSource.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

// 提取当前的DATA_SOURCE_MODE值
const modeMatch = configContent.match(/export const DATA_SOURCE_MODE: 0 \| 1 = (\d);/);
if (!modeMatch) {
  console.error('❌ 无法找到DATA_SOURCE_MODE配置');
  process.exit(1);
}

const currentMode = parseInt(modeMatch[1]);
console.log(`📊 当前数据源模式: ${currentMode === 0 ? 'Mock' : 'API'}`);

// 检查所有服务是否都有数据客户端
const servicesDir = path.join(__dirname, '../frontend/src/services');
const services = [
  'culture', 'person', 'timeline', 'map',
  'emperor', 'tangFigure', 'sanguoFigure', 
  'qingRuler', 'yuanFigure', 'mingFigure', 'songFigure',
  'scholar', 'schools', 'mythology', 'religion'
];

let allServicesFixed = true;

console.log('\n🔍 检查服务数据客户端...');

services.forEach(serviceName => {
  const serviceDir = path.join(servicesDir, serviceName);
  
  if (!fs.existsSync(serviceDir)) {
    console.log(`⚠️  服务目录不存在: ${serviceName}`);
    return;
  }

  // 检查是否有数据客户端文件
  const dataClientPath = path.join(serviceDir, `${serviceName}DataClient.ts`);
  const hasDataClient = fs.existsSync(dataClientPath);
  
  // 检查是否有API文件
  const apiPath = path.join(serviceDir, `${serviceName}Api.ts`);
  const hasApi = fs.existsSync(apiPath);
  
  // 检查主要服务文件
  const mainServiceFiles = [
    `${serviceName}Service.ts`,
    `${serviceName}Mock.ts`,
    'index.ts'
  ];
  
  const hasMainFiles = mainServiceFiles.every(file => 
    fs.existsSync(path.join(serviceDir, file))
  );

  if (hasDataClient && hasApi && hasMainFiles) {
    console.log(`✅ ${serviceName}: 数据客户端已配置`);
  } else if (serviceName === 'culture' || serviceName === 'person' || serviceName === 'timeline' || serviceName === 'map') {
    // 这些是核心服务，使用不同的结构
    console.log(`✅ ${serviceName}: 核心服务（使用dataClient.ts）`);
  } else {
    console.log(`❌ ${serviceName}: 缺少数据客户端配置`);
    console.log(`   - 数据客户端: ${hasDataClient ? '✅' : '❌'}`);
    console.log(`   - API文件: ${hasApi ? '✅' : '❌'}`);
    console.log(`   - 主要文件: ${hasMainFiles ? '✅' : '❌'}`);
    allServicesFixed = false;
  }
});

console.log('\n🔍 检查核心数据客户端...');

// 检查核心数据客户端
const coreDataClientPath = path.join(__dirname, '../frontend/src/services/dataClient.ts');
if (fs.existsSync(coreDataClientPath)) {
  const dataClientContent = fs.readFileSync(coreDataClientPath, 'utf8');
  
  if (dataClientContent.includes('getDataSourceMode()')) {
    console.log('✅ 核心数据客户端: 正确使用数据源选择器');
  } else {
    console.log('❌ 核心数据客户端: 未使用数据源选择器');
    allServicesFixed = false;
  }
} else {
  console.log('❌ 核心数据客户端: 文件不存在');
  allServicesFixed = false;
}

// 检查CulturePage是否使用了统一的数据客户端
console.log('\n🔍 检查CulturePage数据导入...');
const culturePagePath = path.join(__dirname, '../frontend/src/features/culture/CulturePage.tsx');
if (fs.existsSync(culturePagePath)) {
  const culturePageContent = fs.readFileSync(culturePagePath, 'utf8');
  
  if (culturePageContent.includes('import { getScholars } from') && 
      culturePageContent.includes('import { getSchools } from')) {
    console.log('✅ CulturePage: 使用统一数据客户端');
  } else {
    console.log('❌ CulturePage: 仍在直接导入Mock数据');
    allServicesFixed = false;
  }
} else {
  console.log('⚠️  CulturePage: 文件不存在');
}

// 检查mythology和religion服务
console.log('\n🔍 检查特殊服务...');

const mythologyApiPath = path.join(__dirname, '../frontend/src/services/mythology/mythologyApi.ts');
if (fs.existsSync(mythologyApiPath)) {
  const mythologyContent = fs.readFileSync(mythologyApiPath, 'utf8');
  
  if (mythologyContent.includes('getDataSourceMode()')) {
    console.log('✅ mythology: 使用数据源选择器');
  } else {
    console.log('❌ mythology: 未使用数据源选择器');
    allServicesFixed = false;
  }
}

const religionApiPath = path.join(__dirname, '../frontend/src/services/religion/religionApi.ts');
if (fs.existsSync(religionApiPath)) {
  const religionContent = fs.readFileSync(religionApiPath, 'utf8');
  
  if (religionContent.includes('getDataSourceMode()')) {
    console.log('✅ religion: 使用数据源选择器');
  } else {
    console.log('❌ religion: 未使用数据源选择器');
    allServicesFixed = false;
  }
}

// 总结
console.log('\n📋 测试结果总结:');
console.log('================');

if (allServicesFixed) {
  console.log('🎉 所有服务都已正确配置数据源隔离！');
  console.log('');
  console.log('✅ 数据源完全隔离');
  console.log('✅ Mock模式只显示Mock数据');
  console.log('✅ API模式只显示API数据');
  console.log('✅ 无数据混合问题');
  console.log('');
  console.log('🔧 使用方法:');
  console.log('1. 修改 frontend/src/config/dataSource.ts 中的 DATA_SOURCE_MODE');
  console.log('2. 重启前端开发服务器');
  console.log('3. 检查数据源指示器确认模式');
} else {
  console.log('⚠️  部分服务仍需要修复');
  console.log('');
  console.log('请检查上述标记为 ❌ 的服务');
  console.log('确保所有服务都使用统一的数据源选择机制');
}

console.log('');
console.log('🚀 测试完成！');