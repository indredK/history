/**
 * 移动端毛玻璃配置
 * Mobile Glassmorphism Configuration
 * 
 * 移动端优化：
 * - 减少模糊值以提升性能
 * - 提高透明度以增强可读性
 * - 缩短动画时长以提升响应速度
 */

import type { GlassConfig } from './types';

/**
 * 移动端毛玻璃配置
 * - 模糊值：light=8px, medium=12px, heavy=20px, ultra=32px
 * - 透明度范围：0.5-0.9
 * - 动画时长：150-200ms
 */
export const mobileConfig: GlassConfig = {
  blur: {
    none: '0px',
    light: '8px',
    medium: '12px',
    heavy: '20px',
    ultra: '32px'
  },
  bgOpacity: {
    ultraLight: 0.15,
    light: 0.4,
    medium: 0.6,
    high: 0.8,
    solid: 0.9
  },
  border: {
    color: 'rgba(255, 255, 255, 0.15)',
    width: '0.5px',
    radius: {
      sm: '6px',
      md: '10px',
      lg: '14px',
      xl: '20px',
      full: '9999px'
    }
  },
  shadow: {
    sm: '0 1px 4px rgba(0, 0, 0, 0.08)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
    glow: '0 0 12px rgba(255, 255, 255, 0.08)',
    inset: 'inset 0 0.5px 0.5px rgba(255, 255, 255, 0.08)'
  },
  animation: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms'
    },
    hoverDuration: '100ms',
    blurDuration: '150ms',
    opacityDuration: '150ms',
    enter: {
      scale: 0.97,
      translateY: '8px',
      translateX: '15px'
    }
  },
  components: {
    card: {
      blur: '8px',
      bgOpacity: 0.7,
      hoverOpacityDelta: 0.08
    },
    navigation: {
      blur: '12px',
      bgOpacity: 0.8,
      itemHoverOpacity: 0.85,
      activeGlow: '0 0 10px rgba(255, 255, 255, 0.15)'
    },
    button: {
      primary: { blur: '8px', bgOpacity: 0.75 },
      secondary: { blur: '6px', bgOpacity: 0.6 },
      icon: { blur: '6px', bgOpacity: 0.5 }
    },
    table: {
      container: { blur: '8px', bgOpacity: 0.6 },
      header: { blur: '10px', bgOpacity: 0.75 },
      row: { bgOpacity: 0.4, hoverOpacity: 0.55 }
    },
    modal: {
      backdrop: { blur: '16px', bgOpacity: 0.7 },
      content: { blur: '12px', bgOpacity: 0.85 }
    },
    popover: { blur: '10px', bgOpacity: 0.8 },
    tooltip: { blur: '6px', bgOpacity: 0.85 },
    dropdown: { blur: '10px', bgOpacity: 0.8 },
    scrollbar: {
      thumb: { bgOpacity: 0.6 },
      track: { bgOpacity: 0.25 }
    }
  },
  performance: {
    enableBlur: true,
    willChange: ['opacity'],
    containment: 'layout style'
  },
  fallback: {
    bgColor: 'rgba(30, 30, 30, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.08)'
  }
};
