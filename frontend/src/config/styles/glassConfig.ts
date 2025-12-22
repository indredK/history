/**
 * 毛玻璃配置主文件
 * Main Glassmorphism Configuration
 * 
 * 导出桌面端和移动端配置，提供配置获取函数
 */

import { desktopConfig } from './glassConfig.desktop';
import { mobileConfig } from './glassConfig.mobile';
import type { 
  GlassConfig, 
  GlassStyleOptions,
  BlurLevels,
  BackgroundOpacity,
  BorderRadius,
  ShadowConfig,
  AnimationConfig,
  AnimationEnterConfig,
  ReducedMotionConfig
} from './types';

// 导出配置
export { desktopConfig, mobileConfig };

// 导出类型
export type { 
  GlassConfig, 
  GlassStyleOptions,
  BlurLevels,
  BackgroundOpacity,
  BorderRadius,
  ShadowConfig,
  AnimationConfig,
  AnimationEnterConfig,
  ReducedMotionConfig
};

// 移动端断点
const MOBILE_BREAKPOINT = 768;

/**
 * 根据屏幕宽度获取对应的毛玻璃配置
 * Returns appropriate config based on screen width
 * 
 * @param screenWidth - 屏幕宽度（像素）
 * @returns GlassConfig - 对应的毛玻璃配置
 */
export function getGlassConfig(screenWidth: number): GlassConfig {
  try {
    return screenWidth < MOBILE_BREAKPOINT ? mobileConfig : desktopConfig;
  } catch (error) {
    console.warn('Failed to load glass config, using desktop fallback');
    return desktopConfig;
  }
}

/**
 * 检测当前是否为移动端
 * Detects if current viewport is mobile
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * 获取毛玻璃样式对象
 * Generates glassmorphism style object based on options
 * 
 * @param options - 样式选项
 * @param config - 毛玻璃配置（可选，默认根据屏幕宽度自动选择）
 * @returns React.CSSProperties - CSS样式对象
 */
export function getGlassStyle(
  options: GlassStyleOptions = {},
  config?: GlassConfig
): React.CSSProperties {
  const glassConfig = config || getGlassConfig(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const {
    blur = 'medium',
    bgOpacity = 'medium',
    bgColor = 'rgba(255, 255, 255,',
    borderRadius = 'md',
    shadow = 'md'
  } = options;

  const blurValue = glassConfig.blur[blur];
  const opacityValue = glassConfig.bgOpacity[bgOpacity];
  const radiusValue = glassConfig.border.radius[borderRadius];
  const shadowValue = shadow === 'none' ? 'none' : glassConfig.shadow[shadow];

  return {
    backdropFilter: `blur(${blurValue})`,
    WebkitBackdropFilter: `blur(${blurValue})`,
    backgroundColor: `${bgColor} ${opacityValue})`,
    borderRadius: radiusValue,
    border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
    boxShadow: shadowValue,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`
  };
}

/**
 * 获取组件特定的毛玻璃样式
 * Gets component-specific glassmorphism styles
 * 
 * @param componentType - 组件类型
 * @param config - 毛玻璃配置（可选）
 * @returns React.CSSProperties - CSS样式对象
 */
export function getComponentGlassStyle(
  componentType: keyof GlassConfig['components'],
  config?: GlassConfig
): React.CSSProperties {
  const glassConfig = config || getGlassConfig(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const componentConfig = glassConfig.components[componentType];
  
  if ('blur' in componentConfig && 'bgOpacity' in componentConfig) {
    return {
      backdropFilter: `blur(${componentConfig.blur})`,
      WebkitBackdropFilter: `blur(${componentConfig.blur})`,
      backgroundColor: `rgba(255, 255, 255, ${componentConfig.bgOpacity})`,
      border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
      borderRadius: glassConfig.border.radius.md,
      boxShadow: glassConfig.shadow.md,
      transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`
    };
  }

  return {};
}

/**
 * 检查浏览器是否支持 backdrop-filter
 * Checks if browser supports backdrop-filter
 */
export function supportsBackdropFilter(): boolean {
  if (typeof window === 'undefined') return true;
  return CSS.supports('backdrop-filter', 'blur(1px)') || 
         CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
}

/**
 * 检查用户是否偏好减少动画
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 获取降级样式（不支持 backdrop-filter 时使用）
 * Gets fallback styles for unsupported browsers
 */
export function getFallbackStyle(config?: GlassConfig): React.CSSProperties {
  const glassConfig = config || getGlassConfig(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  return {
    backgroundColor: glassConfig.fallback.bgColor,
    border: `${glassConfig.border.width} solid ${glassConfig.fallback.borderColor}`,
    borderRadius: glassConfig.border.radius.md,
    boxShadow: glassConfig.shadow.md
  };
}

/**
 * 检测是否为低端设备
 * Detects if the device is a low-end device
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  
  // Check hardware concurrency (CPU cores)
  const lowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
  
  // Check device memory (if available)
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowMemory = deviceMemory !== undefined && deviceMemory <= 2;
  
  // Check connection type for slow networks (if available)
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  const slowNetwork = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
  
  return lowCPU || lowMemory || slowNetwork;
}

/**
 * 检测是否应该启用模糊效果
 * Determines if blur effects should be enabled based on device capabilities
 */
export function shouldEnableBlur(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Check if user prefers reduced motion
  if (prefersReducedMotion()) return false;
  
  // Check if device is low-end
  if (isLowEndDevice()) return false;
  
  // Check if backdrop-filter is supported
  if (!supportsBackdropFilter()) return false;
  
  return true;
}

/**
 * 获取性能优化的CSS类名
 * Gets performance-optimized CSS class names based on device capabilities
 */
export function getPerformanceClasses(): string[] {
  const classes: string[] = [];
  
  if (typeof window === 'undefined') return classes;
  
  // Add reduced motion class
  if (prefersReducedMotion()) {
    classes.push('glass-reduced-motion');
  }
  
  // Add low-end device class
  if (isLowEndDevice()) {
    classes.push('glass-low-end-device');
  }
  
  // Add no-blur class if blur should be disabled
  if (!shouldEnableBlur()) {
    classes.push('glass-no-blur');
  }
  
  return classes;
}

/**
 * 获取性能优化的样式对象
 * Gets performance-optimized style object based on config
 */
export function getPerformanceStyle(config?: GlassConfig): React.CSSProperties {
  const glassConfig = config || getGlassConfig(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  
  const style: React.CSSProperties = {};
  
  // Apply will-change based on config
  if (glassConfig.performance.willChange.length > 0) {
    style.willChange = glassConfig.performance.willChange.join(', ');
  }
  
  // Apply containment based on config
  if (glassConfig.performance.containment) {
    (style as Record<string, string>).contain = glassConfig.performance.containment;
  }
  
  return style;
}

/**
 * 应用性能优化类到根元素
 * Applies performance optimization classes to the root element
 */
export function applyPerformanceOptimizations(): void {
  if (typeof document === 'undefined') return;
  
  const classes = getPerformanceClasses();
  const root = document.documentElement;
  
  classes.forEach(className => {
    root.classList.add(className);
  });
}

/**
 * 移除性能优化类从根元素
 * Removes performance optimization classes from the root element
 */
export function removePerformanceOptimizations(): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const performanceClasses = ['glass-reduced-motion', 'glass-low-end-device', 'glass-no-blur', 'glass-battery-saver'];
  
  performanceClasses.forEach(className => {
    root.classList.remove(className);
  });
}
