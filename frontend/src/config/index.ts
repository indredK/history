/**
 * 配置文件统一导出
 * 提供应用所有配置的统一入口
 */

// 导出主题配置
export * from './theme';
export { default as theme } from './theme';

// 导出导航配置
export * from './navigation';
export { default as navigation } from './navigation';

// 导出导航项配置
export * from './navigationItems';

// 导出朝代配置
export * from './dynasty';
export { default as dynasty } from './dynasty';

// 导出UI组件配置
export * from './ui';
export { default as ui } from './ui';