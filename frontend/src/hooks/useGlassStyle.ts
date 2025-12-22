/**
 * 毛玻璃样式 Hook
 * useGlassStyle Hook for Glassmorphism Styles
 * 
 * Requirements: 1.8, 13.1, 13.2, 13.3, 13.4, 13.5
 * 
 * 集成 useResponsive Hook 获取屏幕信息，
 * 根据设备类型返回对应的毛玻璃样式
 * 包含性能优化支持
 */

import { useMemo, useEffect, useState } from 'react';
import { useResponsive } from './useResponsive';
import { 
  getGlassConfig, 
  supportsBackdropFilter, 
  prefersReducedMotion,
  isLowEndDevice,
  shouldEnableBlur,
  getPerformanceClasses
} from '../config/styles';
import type { 
  GlassStyleOptions, 
  GlassStyleResult,
  GlassConfig
} from '../config/styles';

/**
 * 性能优化选项接口
 * Performance optimization options interface
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */
export interface PerformanceOptions {
  /** 是否启用 will-change 优化 */
  enableWillChange?: boolean;
  /** 是否启用 CSS containment */
  enableContainment?: boolean;
  /** 是否强制禁用模糊效果 */
  forceDisableBlur?: boolean;
  /** 是否启用 GPU 加速 */
  enableGPUAcceleration?: boolean;
}

/**
 * 毛玻璃样式 Hook
 * 
 * @param options - 样式选项
 * @param performanceOptions - 性能优化选项
 * @returns GlassStyleResult - 包含 style, className, hoverStyle 的对象
 * 
 * @example
 * ```tsx
 * const { style, className, hoverStyle } = useGlassStyle({
 *   blur: 'medium',
 *   bgOpacity: 'high',
 *   borderRadius: 'lg',
 *   shadow: 'md',
 *   hover: true
 * });
 * 
 * return <div style={style} className={className}>Content</div>;
 * ```
 */
export function useGlassStyle(
  options: GlassStyleOptions = {},
  performanceOptions: PerformanceOptions = {}
): GlassStyleResult {
  const { screenWidth } = useResponsive();
  
  // 检测性能相关状态
  const [performanceState, setPerformanceState] = useState({
    supportsBlur: true,
    reducedMotion: false,
    isLowEnd: false,
    shouldBlur: true
  });
  
  // 在客户端检测性能状态
  useEffect(() => {
    setPerformanceState({
      supportsBlur: supportsBackdropFilter(),
      reducedMotion: prefersReducedMotion(),
      isLowEnd: isLowEndDevice(),
      shouldBlur: shouldEnableBlur()
    });
  }, []);
  
  const result = useMemo(() => {
    const config = getGlassConfig(screenWidth);
    const { supportsBlur, reducedMotion, isLowEnd, shouldBlur } = performanceState;
    
    const {
      blur = 'medium',
      bgOpacity = 'medium',
      bgColor = 'rgba(255, 255, 255,',
      borderRadius = 'md',
      shadow = 'md',
      hover = false
    } = options;
    
    const {
      enableWillChange = true,
      enableContainment = true,
      forceDisableBlur = false,
      enableGPUAcceleration = false
    } = performanceOptions;

    // 获取配置值
    const blurValue = config.blur[blur];
    const opacityValue = config.bgOpacity[bgOpacity];
    const radiusValue = config.border.radius[borderRadius];
    const shadowValue = shadow === 'none' ? 'none' : config.shadow[shadow];
    
    // 计算动画时长（如果用户偏好减少动画则使用0）
    const transitionDuration = reducedMotion ? '0ms' : config.animation.duration.normal;
    
    // 确定是否应该启用模糊效果
    const enableBlur = supportsBlur && shouldBlur && !forceDisableBlur && !isLowEnd;
    
    // 基础样式
    const baseStyle: React.CSSProperties = enableBlur
      ? {
          backdropFilter: `blur(${blurValue})`,
          WebkitBackdropFilter: `blur(${blurValue})`,
          backgroundColor: `${bgColor} ${opacityValue})`,
          borderRadius: radiusValue,
          border: `${config.border.width} solid ${config.border.color}`,
          boxShadow: shadowValue,
          transition: reducedMotion ? 'none' : `all ${transitionDuration} ${config.animation.easing}`
        }
      : {
          // 降级样式（不支持 backdrop-filter 或低端设备）
          backgroundColor: config.fallback.bgColor,
          borderRadius: radiusValue,
          border: `${config.border.width} solid ${config.fallback.borderColor}`,
          boxShadow: shadowValue,
          transition: reducedMotion ? 'none' : `all ${transitionDuration} ${config.animation.easing}`
        };
    
    // 添加性能优化样式 (Requirements: 13.1, 13.5)
    if (enableWillChange && !reducedMotion && !isLowEnd) {
      baseStyle.willChange = config.performance.willChange.join(', ');
    }
    
    if (enableContainment) {
      (baseStyle as Record<string, string>).contain = config.performance.containment;
    }
    
    // GPU 加速 (Requirements: 13.1)
    if (enableGPUAcceleration) {
      baseStyle.transform = 'translateZ(0)';
      (baseStyle as Record<string, string>).backfaceVisibility = 'hidden';
    }

    // 生成 className
    const classNames = [
      'glass-effect',
      `glass-blur-${blur}`,
      `glass-opacity-${bgOpacity}`,
      `glass-radius-${borderRadius}`,
      shadow !== 'none' ? `glass-shadow-${shadow}` : '',
      // 添加性能优化类
      isLowEnd ? 'glass-low-end-device' : '',
      reducedMotion ? 'glass-reduced-motion' : '',
      !enableBlur ? 'glass-no-blur' : ''
    ].filter(Boolean).join(' ');

    // 悬停样式
    let hoverStyle: React.CSSProperties | undefined;
    if (hover && !reducedMotion) {
      const hoverOpacity = Math.min(opacityValue + 0.1, 0.95);
      const hoverTransition = config.animation.hoverDuration;
      
      hoverStyle = enableBlur
        ? {
            backgroundColor: `${bgColor} ${hoverOpacity})`,
            boxShadow: config.shadow.lg,
            transition: `all ${hoverTransition} ${config.animation.easing}`
          }
        : {
            backgroundColor: config.fallback.bgColor,
            boxShadow: config.shadow.lg,
            transition: `all ${hoverTransition} ${config.animation.easing}`
          };
    }

    return {
      style: baseStyle,
      className: classNames,
      hoverStyle
    };
  }, [screenWidth, performanceState, options.blur, options.bgOpacity, options.bgColor, options.borderRadius, options.shadow, options.hover, performanceOptions.enableWillChange, performanceOptions.enableContainment, performanceOptions.forceDisableBlur, performanceOptions.enableGPUAcceleration]);

  return result;
}

/**
 * 获取组件特定的毛玻璃样式 Hook
 * 
 * @param componentType - 组件类型
 * @param performanceOptions - 性能优化选项
 * @returns GlassStyleResult - 包含 style, className, hoverStyle 的对象
 * 
 * @example
 * ```tsx
 * const { style, className } = useComponentGlassStyle('card');
 * return <div style={style} className={className}>Card Content</div>;
 * ```
 */
export function useComponentGlassStyle(
  componentType: keyof GlassConfig['components'],
  performanceOptions: PerformanceOptions = {}
): GlassStyleResult {
  const { screenWidth } = useResponsive();
  
  // 检测性能相关状态
  const [performanceState, setPerformanceState] = useState({
    supportsBlur: true,
    reducedMotion: false,
    isLowEnd: false,
    shouldBlur: true
  });
  
  // 在客户端检测性能状态
  useEffect(() => {
    setPerformanceState({
      supportsBlur: supportsBackdropFilter(),
      reducedMotion: prefersReducedMotion(),
      isLowEnd: isLowEndDevice(),
      shouldBlur: shouldEnableBlur()
    });
  }, []);
  
  const result = useMemo(() => {
    const config = getGlassConfig(screenWidth);
    const { supportsBlur, reducedMotion, isLowEnd, shouldBlur } = performanceState;
    
    const {
      enableWillChange = true,
      enableContainment = true,
      forceDisableBlur = false,
      enableGPUAcceleration = false
    } = performanceOptions;
    
    const componentConfig = config.components[componentType];
    const transitionDuration = reducedMotion ? '0ms' : config.animation.duration.normal;
    
    // 确定是否应该启用模糊效果
    const enableBlur = supportsBlur && shouldBlur && !forceDisableBlur && !isLowEnd;
    
    let baseStyle: React.CSSProperties = {};
    let hoverStyle: React.CSSProperties | undefined;
    
    // 处理不同组件类型的配置
    if ('blur' in componentConfig && 'bgOpacity' in componentConfig) {
      const { blur, bgOpacity } = componentConfig as { blur: string; bgOpacity: number };
      
      baseStyle = enableBlur
        ? {
            backdropFilter: `blur(${blur})`,
            WebkitBackdropFilter: `blur(${blur})`,
            backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
            border: `${config.border.width} solid ${config.border.color}`,
            borderRadius: config.border.radius.md,
            boxShadow: config.shadow.md,
            transition: reducedMotion ? 'none' : `all ${transitionDuration} ${config.animation.easing}`
          }
        : {
            backgroundColor: config.fallback.bgColor,
            border: `${config.border.width} solid ${config.fallback.borderColor}`,
            borderRadius: config.border.radius.md,
            boxShadow: config.shadow.md,
            transition: reducedMotion ? 'none' : `all ${transitionDuration} ${config.animation.easing}`
          };
      
      // 添加性能优化样式 (Requirements: 13.1, 13.5)
      if (enableWillChange && !reducedMotion && !isLowEnd) {
        baseStyle.willChange = config.performance.willChange.join(', ');
      }
      
      if (enableContainment) {
        (baseStyle as Record<string, string>).contain = config.performance.containment;
      }
      
      // GPU 加速 (Requirements: 13.1)
      if (enableGPUAcceleration) {
        baseStyle.transform = 'translateZ(0)';
        (baseStyle as Record<string, string>).backfaceVisibility = 'hidden';
      }
      
      // 如果组件配置有 hoverOpacityDelta，生成悬停样式
      if ('hoverOpacityDelta' in componentConfig && !reducedMotion) {
        const delta = (componentConfig as { hoverOpacityDelta: number }).hoverOpacityDelta;
        const hoverOpacity = Math.min(bgOpacity + delta, 0.95);
        const hoverTransition = config.animation.hoverDuration;
        
        hoverStyle = enableBlur
          ? {
              backgroundColor: `rgba(255, 255, 255, ${hoverOpacity})`,
              boxShadow: config.shadow.lg,
              transition: `all ${hoverTransition} ${config.animation.easing}`
            }
          : {
              backgroundColor: config.fallback.bgColor,
              boxShadow: config.shadow.lg,
              transition: `all ${hoverTransition} ${config.animation.easing}`
            };
      }
    }

    // 生成 className，包含性能优化类
    const classNames = [
      `glass-${componentType}`,
      isLowEnd ? 'glass-low-end-device' : '',
      reducedMotion ? 'glass-reduced-motion' : '',
      !enableBlur ? 'glass-no-blur' : ''
    ].filter(Boolean).join(' ');

    return {
      style: baseStyle,
      className: classNames,
      hoverStyle
    };
  }, [screenWidth, componentType, performanceState, performanceOptions.enableWillChange, performanceOptions.enableContainment, performanceOptions.forceDisableBlur, performanceOptions.enableGPUAcceleration]);

  return result;
}

/**
 * 性能优化 Hook
 * Returns performance-related information and utility functions
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 * 
 * @example
 * ```tsx
 * const { isLowEnd, reducedMotion, shouldBlur, performanceClasses } = useGlassPerformance();
 * ```
 */
export function useGlassPerformance() {
  const [state, setState] = useState({
    supportsBlur: true,
    reducedMotion: false,
    isLowEnd: false,
    shouldBlur: true,
    performanceClasses: [] as string[]
  });
  
  useEffect(() => {
    setState({
      supportsBlur: supportsBackdropFilter(),
      reducedMotion: prefersReducedMotion(),
      isLowEnd: isLowEndDevice(),
      shouldBlur: shouldEnableBlur(),
      performanceClasses: getPerformanceClasses()
    });
  }, []);
  
  return state;
}

// 导出类型
export type { GlassStyleOptions, GlassStyleResult };
