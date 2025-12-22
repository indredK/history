/**
 * 样式配置类型定义
 * Style Configuration Type Definitions
 * 
 * 包含毛玻璃样式和经典样式的类型定义
 */

// ============================================
// 样式模式类型 (Style Mode Types)
// ============================================

/** 样式模式类型 */
export type StyleMode = 'glass' | 'classic';

/** 默认样式 */
export const DEFAULT_STYLE: StyleMode = 'glass';

/** localStorage 存储键 */
export const STYLE_STORAGE_KEY = 'app-style';

/**
 * 验证样式值是否有效
 * @param value - 要验证的值
 * @returns 是否为有效的样式模式
 */
export function isValidStyle(value: unknown): value is StyleMode {
  return value === 'glass' || value === 'classic';
}

// ============================================
// 通用类型定义 (Common Type Definitions)
// ============================================

/**
 * 模糊级别配置
 * Blur levels configuration with named presets
 */
export interface BlurLevels {
  none: string;      // '0px'
  light: string;     // 桌面: '12px', 移动: '8px'
  medium: string;    // 桌面: '20px', 移动: '12px'
  heavy: string;     // 桌面: '32px', 移动: '20px'
  ultra: string;     // 桌面: '48px', 移动: '32px'
}

/**
 * 背景透明度配置
 * Background opacity levels (0.1 to 0.9 range)
 */
export interface BackgroundOpacity {
  ultraLight: number;  // 0.1
  light: number;       // 0.3
  medium: number;      // 0.5
  high: number;        // 0.7
  solid: number;       // 0.85
}

/**
 * 圆角配置
 * Border radius configuration
 */
export interface BorderRadius {
  sm: string;        // '8px'
  md: string;        // '12px'
  lg: string;        // '16px'
  xl: string;        // '24px'
  full: string;      // '9999px'
}

/**
 * 边框配置
 * Border styles configuration
 */
export interface BorderConfig {
  color: string;       // rgba(255, 255, 255, 0.18)
  width: string;       // 桌面: '1px', 移动: '0.5px'
  radius: BorderRadius;
}

/**
 * 阴影配置
 * Shadow styles for depth
 */
export interface ShadowConfig {
  sm: string;
  md: string;
  lg: string;
  glow: string;
  inset: string;
}

/**
 * 动画时长配置
 * Animation duration configuration
 */
export interface AnimationDuration {
  fast: string;           // '150ms'
  normal: string;         // '250ms'
  slow: string;           // '350ms'
}

/**
 * 动画配置
 * Animation configuration for smooth transitions
 */
export interface AnimationConfig {
  easing: string;           // 'cubic-bezier(0.4, 0, 0.2, 1)'
  duration: AnimationDuration;
  hoverDuration: string;    // '150ms'
  blurDuration: string;     // '200ms'
  opacityDuration: string;  // '200ms'
  enter?: AnimationEnterConfig;  // Optional enter animation settings
}

/**
 * 动画进入配置
 * Animation enter settings for element appearance
 */
export interface AnimationEnterConfig {
  scale: number;            // Initial scale (e.g., 0.95)
  translateY: string;       // Initial Y translation (e.g., '10px')
  translateX: string;       // Initial X translation (e.g., '20px')
}

// ============================================
// 毛玻璃样式类型 (Glass Style Types)
// ============================================

/**
 * 卡片组件配置 - 毛玻璃
 */
export interface CardComponentConfig {
  blur: string;
  bgOpacity: number;
  hoverOpacityDelta: number;
}

/**
 * 导航组件配置 - 毛玻璃
 */
export interface NavigationComponentConfig {
  blur: string;
  bgOpacity: number;
  itemHoverOpacity: number;
  activeGlow: string;
}

/**
 * 按钮样式配置
 */
export interface ButtonStyleConfig {
  blur: string;
  bgOpacity: number;
}

/**
 * 按钮组件配置
 */
export interface ButtonComponentConfig {
  primary: ButtonStyleConfig;
  secondary: ButtonStyleConfig;
  icon: ButtonStyleConfig;
}

/**
 * 表格行配置
 */
export interface TableRowConfig {
  bgOpacity: number;
  hoverOpacity: number;
}

/**
 * 表格组件配置
 */
export interface TableComponentConfig {
  container: ButtonStyleConfig;
  header: ButtonStyleConfig;
  row: TableRowConfig;
}

/**
 * 模态框组件配置
 */
export interface ModalComponentConfig {
  backdrop: ButtonStyleConfig;
  content: ButtonStyleConfig;
}

/**
 * 滚动条组件配置
 */
export interface ScrollbarComponentConfig {
  thumb: { bgOpacity: number };
  track: { bgOpacity: number };
}

/**
 * 组件特定配置 - 毛玻璃
 * Component-specific glassmorphism configurations
 */
export interface ComponentConfig {
  card: CardComponentConfig;
  navigation: NavigationComponentConfig;
  button: ButtonComponentConfig;
  table: TableComponentConfig;
  modal: ModalComponentConfig;
  popover: ButtonStyleConfig;
  tooltip: ButtonStyleConfig;
  dropdown: ButtonStyleConfig;
  scrollbar: ScrollbarComponentConfig;
}

/**
 * 性能配置
 * Performance optimization settings
 */
export interface PerformanceConfig {
  enableBlur: boolean;
  willChange: string[];
  containment: string;
}

/**
 * 减少动画配置
 * Reduced motion settings for accessibility
 */
export interface ReducedMotionConfig {
  disableTransitions: boolean;
  disableAnimations: boolean;
  disableWillChange: boolean;
  disableTransforms: boolean;
}

/**
 * 降级配置
 * Fallback configuration for unsupported browsers
 */
export interface FallbackConfig {
  bgColor: string;
  borderColor: string;
}

/**
 * 完整的毛玻璃配置
 * Complete glassmorphism configuration interface
 */
export interface GlassConfig {
  blur: BlurLevels;
  bgOpacity: BackgroundOpacity;
  border: BorderConfig;
  shadow: ShadowConfig;
  animation: AnimationConfig;
  components: ComponentConfig;
  performance: PerformanceConfig;
  fallback: FallbackConfig;
}

/**
 * 毛玻璃样式选项
 * Options for useGlassStyle hook
 */
export interface GlassStyleOptions {
  blur?: keyof BlurLevels;
  bgOpacity?: keyof BackgroundOpacity;
  bgColor?: string;
  borderRadius?: keyof BorderRadius;
  shadow?: keyof ShadowConfig | 'none';
  hover?: boolean;
}

/**
 * 毛玻璃样式结果
 * Result from useGlassStyle hook
 */
export interface GlassStyleResult {
  style: React.CSSProperties;
  className: string;
  hoverStyle?: React.CSSProperties | undefined;
}

// ============================================
// 经典样式类型 (Classic Style Types)
// ============================================

/**
 * 经典样式背景配置
 * Classic style background configuration (solid colors, no blur)
 */
export interface ClassicBackground {
  /** 主背景色 */
  primary: string;
  /** 次要背景色 */
  secondary: string;
  /** 表面颜色 */
  surface: string;
  /** 提升层颜色 */
  elevated: string;
}

/**
 * 经典样式卡片组件配置
 */
export interface ClassicCardConfig {
  background: string;
  hoverBackground: string;
}

/**
 * 经典样式导航组件配置
 */
export interface ClassicNavigationConfig {
  background: string;
  itemHoverBackground: string;
  activeBackground: string;
}

/**
 * 经典样式按钮配置
 */
export interface ClassicButtonStyleConfig {
  background: string;
}

/**
 * 经典样式按钮组件配置
 */
export interface ClassicButtonComponentConfig {
  primary: ClassicButtonStyleConfig;
  secondary: ClassicButtonStyleConfig;
  icon: ClassicButtonStyleConfig;
}

/**
 * 经典样式表格行配置
 */
export interface ClassicTableRowConfig {
  background: string;
  hoverBackground: string;
}

/**
 * 经典样式表格组件配置
 */
export interface ClassicTableComponentConfig {
  container: ClassicButtonStyleConfig;
  header: ClassicButtonStyleConfig;
  row: ClassicTableRowConfig;
}

/**
 * 经典样式模态框组件配置
 */
export interface ClassicModalComponentConfig {
  backdrop: ClassicButtonStyleConfig;
  content: ClassicButtonStyleConfig;
}

/**
 * 经典样式组件配置
 * Component-specific classic style configurations
 */
export interface ClassicComponentConfig {
  card: ClassicCardConfig;
  navigation: ClassicNavigationConfig;
  button: ClassicButtonComponentConfig;
  table: ClassicTableComponentConfig;
  modal: ClassicModalComponentConfig;
  popover: ClassicButtonStyleConfig;
  tooltip: ClassicButtonStyleConfig;
  dropdown: ClassicButtonStyleConfig;
}

/**
 * 完整的经典样式配置
 * Complete classic style configuration interface
 */
export interface ClassicConfig {
  /** 背景配置 */
  background: ClassicBackground;
  /** 边框配置 */
  border: BorderConfig;
  /** 阴影配置 */
  shadow: ShadowConfig;
  /** 动画配置 */
  animation: AnimationConfig;
  /** 组件特定配置 */
  components: ClassicComponentConfig;
  /** 性能配置 */
  performance: PerformanceConfig;
}

/**
 * 经典样式选项
 * Options for classic style
 */
export interface ClassicStyleOptions {
  bgColor?: string;
  borderRadius?: keyof BorderRadius;
  shadow?: keyof ShadowConfig | 'none';
  hover?: boolean;
}

/**
 * 经典样式结果
 * Result from classic style functions
 */
export interface ClassicStyleResult {
  style: React.CSSProperties;
  className: string;
  hoverStyle?: React.CSSProperties | undefined;
}
