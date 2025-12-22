/**
 * 桌面端经典样式配置
 * Desktop Classic Style Configuration
 * 
 * 纯色背景、传统阴影、无模糊效果
 * 支持 dark 和 light 主题
 */

import type { ClassicConfig } from './types';

/**
 * 桌面端经典样式配置
 * Desktop classic style configuration with solid colors
 */
export const desktopClassicConfig: ClassicConfig = {
  // 背景配置 - 纯色，无透明度
  background: {
    primary: 'var(--classic-bg-primary)',
    secondary: 'var(--classic-bg-secondary)',
    surface: 'var(--classic-bg-surface)',
    elevated: 'var(--classic-bg-elevated)',
  },

  // 边框配置
  border: {
    color: 'var(--classic-border-color)',
    width: '1px',
    radius: {
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
  },

  // 阴影配置 - 传统阴影
  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    glow: '0 0 0 3px var(--classic-focus-ring)',
    inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  },

  // 动画配置
  animation: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    hoverDuration: '150ms',
    blurDuration: '0ms', // 经典样式无模糊过渡
    opacityDuration: '150ms',
  },

  // 组件特定配置
  components: {
    card: {
      background: 'var(--classic-card-bg)',
      hoverBackground: 'var(--classic-card-hover-bg)',
    },
    navigation: {
      background: 'var(--classic-nav-bg)',
      itemHoverBackground: 'var(--classic-nav-item-hover)',
      activeBackground: 'var(--classic-nav-item-active)',
    },
    button: {
      primary: {
        background: 'var(--classic-btn-primary-bg)',
      },
      secondary: {
        background: 'var(--classic-btn-secondary-bg)',
      },
      icon: {
        background: 'var(--classic-btn-icon-bg)',
      },
    },
    table: {
      container: {
        background: 'var(--classic-table-bg)',
      },
      header: {
        background: 'var(--classic-table-header-bg)',
      },
      row: {
        background: 'var(--classic-table-row-bg)',
        hoverBackground: 'var(--classic-table-row-hover)',
      },
    },
    modal: {
      backdrop: {
        background: 'var(--classic-modal-backdrop)',
      },
      content: {
        background: 'var(--classic-modal-bg)',
      },
    },
    popover: {
      background: 'var(--classic-popover-bg)',
    },
    tooltip: {
      background: 'var(--classic-tooltip-bg)',
    },
    dropdown: {
      background: 'var(--classic-dropdown-bg)',
    },
  },

  // 性能配置 - 经典样式无需特殊优化
  performance: {
    enableBlur: false, // 经典样式不使用模糊
    willChange: ['background-color', 'box-shadow'],
    containment: 'layout style',
  },
};
