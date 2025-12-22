/**
 * 样式配置统一导出
 * Style Configuration Unified Exports
 * 
 * 导出所有样式类型、毛玻璃配置和经典样式配置
 */

// ============================================
// 类型导出 (Type Exports)
// ============================================
export type {
  // 样式模式
  StyleMode,
  
  // 通用类型
  BlurLevels,
  BackgroundOpacity,
  BorderRadius,
  BorderConfig,
  ShadowConfig,
  AnimationDuration,
  AnimationConfig,
  AnimationEnterConfig,
  
  // 毛玻璃样式类型
  GlassConfig,
  GlassStyleOptions,
  GlassStyleResult,
  CardComponentConfig,
  NavigationComponentConfig,
  ButtonStyleConfig,
  ButtonComponentConfig,
  TableRowConfig,
  TableComponentConfig,
  ModalComponentConfig,
  ScrollbarComponentConfig,
  ComponentConfig,
  PerformanceConfig,
  ReducedMotionConfig,
  FallbackConfig,
  
  // 经典样式类型
  ClassicConfig,
  ClassicBackground,
  ClassicStyleOptions,
  ClassicStyleResult,
  ClassicCardConfig,
  ClassicNavigationConfig,
  ClassicButtonStyleConfig,
  ClassicButtonComponentConfig,
  ClassicTableRowConfig,
  ClassicTableComponentConfig,
  ClassicModalComponentConfig,
  ClassicComponentConfig,
} from './types';

// ============================================
// 常量导出 (Constants Exports)
// ============================================
export {
  DEFAULT_STYLE,
  STYLE_STORAGE_KEY,
  isValidStyle,
} from './types';

// ============================================
// 毛玻璃配置导出 (Glass Config Exports)
// ============================================
export {
  desktopConfig as glassDesktopConfig,
  mobileConfig as glassMobileConfig,
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
} from './glassConfig';

// ============================================
// 经典样式配置导出 (Classic Config Exports)
// ============================================
export {
  desktopClassicConfig,
  mobileClassicConfig,
  getClassicConfig,
  getClassicStyle,
  getComponentClassicStyle,
  isClassicRecommended,
} from './classicConfig';
