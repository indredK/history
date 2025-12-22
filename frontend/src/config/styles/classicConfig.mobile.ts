/**
 * 移动端经典样式配置
 * Mobile Classic Style Configuration
 * 
 * 针对移动端优化的经典样式配置
 */

import type { ClassicConfig } from './types';

/**
 * 移动端经典样式配置
 * Mobile classic style configuration optimized for performance
 */
export const mobileClassicConfig: ClassicConfig = {
  // 背景配置 - 与桌面端相同
  background: {
    primary: 'var(--classic-bg-primary)',
    secondary: 'var(--classic-bg-secondary)',
    surface: 'var(--classic-bg-surface)',
    elevated: 'var(--classic-bg-elevated)',
  },

  // 边框配置 - 移动端略微调整
  border: {
    color: 'var(--classic-border-color)',
    width: '1px',
    radius: {
      sm: '4px',
      md: '6px',
      lg: '10px',
      xl: '14px',
      full: '9999px',
    },
  },

  // 阴影配置 - 移动端减轻阴影
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 2px 4px rgba(0, 0, 0, 0.08)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.08)',
    glow: '0 0 0 2px var(--classic-focus-ring)',
    inset: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
  },

  // 动画配置 - 移动端缩短动画时长
  animation: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: {
      fast: '100ms',
      normal: '150ms',
      slow: '250ms',
    },
    hoverDuration: '100ms',
    blurDuration: '0ms',
    opacityDuration: '100ms',
  },

  // 组件特定配置 - 与桌面端相同
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

  // 性能配置 - 移动端进一步简化
  performance: {
    enableBlur: false,
    willChange: ['background-color'],
    containment: 'layout',
  },
};
