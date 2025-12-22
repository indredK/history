/**
 * 样式感知的毛玻璃效果 Hook
 * Style-Aware Glassmorphism Hook
 * 
 * 根据当前样式模式（glass/classic）返回适当的样式
 * 在经典模式下返回无模糊效果的样式
 */

import { useMemo } from 'react';
import { useStyleStore, useThemeStore } from '@/store';
import { getGlassConfig } from '@/config/glassConfig';
import { useResponsive } from './useResponsive';

interface GlassStyleOptions {
  blur?: 'none' | 'light' | 'medium' | 'heavy' | 'ultra';
  bgOpacity?: 'ultraLight' | 'light' | 'medium' | 'high' | 'solid';
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'sm' | 'md' | 'lg' | 'glow' | 'none';
  customBgBase?: string;
}

interface GlassStyleResult {
  backdropFilter: string;
  WebkitBackdropFilter: string;
  backgroundColor: string;
  border: string;
  borderRadius: string;
  boxShadow: string;
  transition: string;
}

/**
 * 获取样式感知的毛玻璃效果
 * 在经典模式下返回无模糊效果的样式
 */
export function useStyleAwareGlass(options: GlassStyleOptions = {}): GlassStyleResult {
  const { style } = useStyleStore();
  const { theme } = useThemeStore();
  const { screenWidth } = useResponsive();
  
  const isClassicStyle = style === 'classic';
  const isDark = theme === 'dark';
  
  return useMemo(() => {
    const glassConfig = getGlassConfig(screenWidth);
    
    const {
      blur = 'medium',
      bgOpacity = 'medium',
      borderRadius = 'lg',
      shadow = 'md',
      customBgBase,
    } = options;
    
    // 根据主题获取背景色基础值
    const bgBase = customBgBase || (isDark ? '30, 30, 30' : '255, 255, 255');
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
    
    if (isClassicStyle) {
      // 经典样式 - 无模糊效果
      const classicBg = isDark ? 'var(--classic-bg-surface)' : 'var(--classic-bg-surface)';
      const classicBorder = isDark ? 'var(--classic-border-color)' : 'var(--classic-border-color)';
      
      return {
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        backgroundColor: classicBg,
        border: `1px solid ${classicBorder}`,
        borderRadius: glassConfig.border.radius[borderRadius],
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        transition: 'all 200ms ease',
      };
    }
    
    // 毛玻璃样式
    const blurValue = glassConfig.blur[blur];
    const opacityValue = glassConfig.bgOpacity[bgOpacity];
    const radiusValue = glassConfig.border.radius[borderRadius];
    const shadowValue = shadow === 'none' ? 'none' : glassConfig.shadow[shadow];
    
    return {
      backdropFilter: `blur(${blurValue})`,
      WebkitBackdropFilter: `blur(${blurValue})`,
      backgroundColor: `rgba(${bgBase}, ${opacityValue})`,
      border: `${glassConfig.border.width} solid ${borderColor}`,
      borderRadius: radiusValue,
      boxShadow: shadowValue,
      transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
    };
  }, [style, theme, screenWidth, options, isClassicStyle, isDark]);
}

/**
 * 检查当前是否为经典样式模式
 */
export function useIsClassicStyle(): boolean {
  const { style } = useStyleStore();
  return style === 'classic';
}

/**
 * 获取当前样式模式
 */
export function useCurrentStyle(): 'glass' | 'classic' {
  const { style } = useStyleStore();
  return style;
}

export default useStyleAwareGlass;
