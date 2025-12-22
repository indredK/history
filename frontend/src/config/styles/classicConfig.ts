/**
 * 经典样式配置主文件
 * Main Classic Style Configuration
 * 
 * 导出桌面端和移动端配置，提供配置获取函数
 */

import { desktopClassicConfig } from './classicConfig.desktop';
import { mobileClassicConfig } from './classicConfig.mobile';
import type { ClassicConfig, ClassicStyleOptions } from './types';

// 导出配置
export { desktopClassicConfig, mobileClassicConfig };

// 移动端断点
const MOBILE_BREAKPOINT = 768;

/**
 * 根据屏幕宽度获取对应的经典样式配置
 * Returns appropriate config based on screen width
 * 
 * @param screenWidth - 屏幕宽度（像素）
 * @returns ClassicConfig - 对应的经典样式配置
 */
export function getClassicConfig(screenWidth: number): ClassicConfig {
  try {
    return screenWidth < MOBILE_BREAKPOINT ? mobileClassicConfig : desktopClassicConfig;
  } catch (error) {
    console.warn('Failed to load classic config, using desktop fallback');
    return desktopClassicConfig;
  }
}

/**
 * 获取经典样式对象
 * Generates classic style object based on options
 * 
 * @param options - 样式选项
 * @param config - 经典样式配置（可选，默认根据屏幕宽度自动选择）
 * @returns React.CSSProperties - CSS样式对象
 */
export function getClassicStyle(
  options: ClassicStyleOptions = {},
  config?: ClassicConfig
): React.CSSProperties {
  const classicConfig = config || getClassicConfig(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const {
    bgColor = classicConfig.background.surface,
    borderRadius = 'md',
    shadow = 'md'
  } = options;

  const radiusValue = classicConfig.border.radius[borderRadius];
  const shadowValue = shadow === 'none' ? 'none' : classicConfig.shadow[shadow];

  return {
    backgroundColor: bgColor,
    borderRadius: radiusValue,
    border: `${classicConfig.border.width} solid ${classicConfig.border.color}`,
    boxShadow: shadowValue,
    transition: `all ${classicConfig.animation.duration.normal} ${classicConfig.animation.easing}`
  };
}

/**
 * 获取组件特定的经典样式
 * Gets component-specific classic styles
 * 
 * @param componentType - 组件类型
 * @param config - 经典样式配置（可选）
 * @returns React.CSSProperties - CSS样式对象
 */
export function getComponentClassicStyle(
  componentType: keyof ClassicConfig['components'],
  config?: ClassicConfig
): React.CSSProperties {
  const classicConfig = config || getClassicConfig(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const componentConfig = classicConfig.components[componentType];
  
  if ('background' in componentConfig) {
    return {
      backgroundColor: componentConfig.background,
      border: `${classicConfig.border.width} solid ${classicConfig.border.color}`,
      borderRadius: classicConfig.border.radius.md,
      boxShadow: classicConfig.shadow.md,
      transition: `all ${classicConfig.animation.duration.normal} ${classicConfig.animation.easing}`
    };
  }

  return {};
}

/**
 * 检测是否推荐使用经典样式
 * Detects if classic style is recommended based on device capabilities
 */
export function isClassicRecommended(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  
  // 检查 CPU 核心数
  const lowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
  
  // 检查设备内存
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowMemory = deviceMemory !== undefined && deviceMemory <= 2;
  
  // 检查网络连接类型
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  const slowNetwork = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
  
  // 检查是否支持 backdrop-filter
  const noBackdropSupport = !CSS.supports('backdrop-filter', 'blur(1px)') && 
                            !CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  
  // 检查用户是否偏好减少动画
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return lowCPU || lowMemory || slowNetwork || noBackdropSupport || prefersReducedMotion;
}
