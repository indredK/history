/**
 * 毛玻璃配置主文件 - 向后兼容导出
 * Main Glassmorphism Configuration - Backward Compatible Exports
 * 
 * 此文件从新的 styles 目录重新导出所有配置
 * 保持向后兼容性，现有代码无需修改
 */

// 从新位置重新导出所有内容
export {
  // 配置
  glassDesktopConfig as desktopConfig,
  glassMobileConfig as mobileConfig,
  
  // 函数
  getGlassConfig,
  getGlassStyle,
  getComponentGlassStyle,
  isMobileViewport,
  supportsBackdropFilter,
  prefersReducedMotion,
  getFallbackStyle,
  isLowEndDevice,
  shouldEnableBlur,
  getPerformanceClasses,
  getPerformanceStyle,
  applyPerformanceOptimizations,
  removePerformanceOptimizations,
} from './styles';

// 重新导出类型
export type {
  GlassConfig,
  GlassStyleOptions,
  BlurLevels,
  BackgroundOpacity,
  BorderRadius,
  ShadowConfig,
  AnimationConfig,
  AnimationEnterConfig,
  ReducedMotionConfig,
} from './styles';

// 导入主题配置
import type { ThemeMode } from './themeConfig';

/**
 * 根据主题获取毛玻璃背景颜色基础值
 * Gets glass background base color based on theme
 */
export function getThemeGlassBgBase(theme: ThemeMode): string {
  return theme === 'dark' ? '30, 30, 30' : '255, 255, 255';
}

/**
 * 根据主题获取边框颜色
 * Gets border color based on theme
 */
export function getThemeBorderColor(theme: ThemeMode): string {
  return theme === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.12)';
}

/**
 * 根据主题获取文字颜色
 * Gets text color based on theme
 */
export function getThemeTextColor(theme: ThemeMode): string {
  return theme === 'dark' 
    ? 'rgba(255, 255, 255, 0.95)' 
    : 'rgba(0, 0, 0, 0.87)';
}

/**
 * 获取主题感知的毛玻璃样式
 * Gets theme-aware glassmorphism style object
 */
import { getGlassConfig } from './styles';
import type { GlassConfig, GlassStyleOptions } from './styles';

export function getThemedGlassStyle(
  theme: ThemeMode,
  options: GlassStyleOptions = {},
  config?: GlassConfig
): React.CSSProperties {
  const glassConfig = config || getGlassConfig(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const {
    blur = 'medium',
    bgOpacity = 'medium',
    borderRadius = 'md',
    shadow = 'md'
  } = options;

  const blurValue = glassConfig.blur[blur];
  const opacityValue = glassConfig.bgOpacity[bgOpacity];
  const radiusValue = glassConfig.border.radius[borderRadius];
  const shadowValue = shadow === 'none' ? 'none' : glassConfig.shadow[shadow];
  
  const bgBase = getThemeGlassBgBase(theme);
  const borderColor = getThemeBorderColor(theme);
  const textColor = getThemeTextColor(theme);

  return {
    backdropFilter: `blur(${blurValue})`,
    WebkitBackdropFilter: `blur(${blurValue})`,
    backgroundColor: `rgba(${bgBase}, ${opacityValue})`,
    borderRadius: radiusValue,
    border: `${glassConfig.border.width} solid ${borderColor}`,
    boxShadow: shadowValue,
    color: textColor,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`
  };
}
