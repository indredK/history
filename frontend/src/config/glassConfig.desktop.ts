/**
 * 桌面端毛玻璃配置
 * Desktop Glassmorphism Configuration
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import type { GlassConfig } from './glassConfig.types';

/**
 * 桌面端毛玻璃配置
 * - 模糊值：light=12px, medium=20px, heavy=32px, ultra=48px
 * - 透明度范围：0.3-0.85
 * - 动画时长：200-300ms
 */
export const desktopConfig: GlassConfig = {
  blur: {
    none: '0px',
    light: '12px',
    medium: '20px',
    heavy: '32px',
    ultra: '48px'
  },
  bgOpacity: {
    ultraLight: 0.1,
    light: 0.3,
    medium: 0.5,
    high: 0.7,
    solid: 0.85
  },
  border: {
    color: 'rgba(255, 255, 255, 0.18)',
    width: '1px',
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      full: '9999px'
    }
  },
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.15)',
    glow: '0 0 20px rgba(255, 255, 255, 0.1)',
    inset: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
  },
  animation: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    },
    hoverDuration: '150ms',
    blurDuration: '200ms',
    opacityDuration: '200ms',
    enter: {
      scale: 0.95,
      translateY: '10px',
      translateX: '20px'
    }
  },
  components: {
    card: {
      blur: '12px',
      bgOpacity: 0.6,
      hoverOpacityDelta: 0.1
    },
    navigation: {
      blur: '20px',
      bgOpacity: 0.7,
      itemHoverOpacity: 0.8,
      activeGlow: '0 0 15px rgba(255, 255, 255, 0.2)'
    },
    button: {
      primary: { blur: '12px', bgOpacity: 0.7 },
      secondary: { blur: '8px', bgOpacity: 0.5 },
      icon: { blur: '8px', bgOpacity: 0.4 }
    },
    table: {
      container: { blur: '12px', bgOpacity: 0.5 },
      header: { blur: '16px', bgOpacity: 0.7 },
      row: { bgOpacity: 0.3, hoverOpacity: 0.5 }
    },
    modal: {
      backdrop: { blur: '24px', bgOpacity: 0.6 },
      content: { blur: '20px', bgOpacity: 0.8 }
    },
    popover: { blur: '16px', bgOpacity: 0.7 },
    tooltip: { blur: '8px', bgOpacity: 0.8 },
    dropdown: { blur: '16px', bgOpacity: 0.7 },
    scrollbar: {
      thumb: { bgOpacity: 0.5 },
      track: { bgOpacity: 0.2 }
    }
  },
  performance: {
    enableBlur: true,
    willChange: ['backdrop-filter', 'background-color', 'opacity'],
    containment: 'layout style paint'
  },
  fallback: {
    bgColor: 'rgba(30, 30, 30, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)'
  }
};
