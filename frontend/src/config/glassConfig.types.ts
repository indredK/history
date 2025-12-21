/**
 * 毛玻璃配置类型定义
 * Glass Configuration Type Definitions
 */

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
 * Shadow styles for glassmorphism depth
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
 * Requirements: 12.4
 */
export interface AnimationEnterConfig {
  scale: number;            // Initial scale (e.g., 0.95)
  translateY: string;       // Initial Y translation (e.g., '10px')
  translateX: string;       // Initial X translation (e.g., '20px')
}


/**
 * 卡片组件配置
 */
export interface CardComponentConfig {
  blur: string;
  bgOpacity: number;
  hoverOpacityDelta: number;
}

/**
 * 导航组件配置
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
 * 组件特定配置
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
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */
export interface PerformanceConfig {
  enableBlur: boolean;
  willChange: string[];
  containment: string;
}

/**
 * 减少动画配置
 * Reduced motion settings for accessibility
 * Requirements: 13.3
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
