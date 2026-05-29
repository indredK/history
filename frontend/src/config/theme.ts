/**
 * 主题配置文件
 * 统一管理应用的颜色、渐变、阴影等主题相关配置
 * 
 * Requirements: 6.5, 11.3
 * 整合毛玻璃配置到主题系统
 */

import { glassDesktopConfig as desktopConfig, glassMobileConfig as mobileConfig, getGlassConfig } from './styles';
import type { GlassConfig } from './styles';
import { dynastyColors, dynastyColorUtils } from './dynasty';

// 导航菜单主题配置
export interface NavigationTheme {
  key: string;
  gradient: string;
  hoverBackground: string;
  // 毛玻璃样式扩展
  glass: {
    blur: string;
    bgOpacity: number;
    borderColor: string;
    activeGlow: string;
  };
}

// 导航菜单主题映射 - 整合毛玻璃风格
export const navigationThemes: Record<string, NavigationTheme> = {
  timeline: {
    key: 'timeline',
    gradient: 'var(--color-primary-gradient)',
    hoverBackground: 'rgba(199, 143, 69, 0.1)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(199, 143, 69, 0.22)',
      activeGlow: '0 0 15px rgba(199, 143, 69, 0.24)'
    }
  },
  dynasties: {
    key: 'dynasties',
    gradient: 'var(--color-primary-gradient)',
    hoverBackground: 'rgba(199, 143, 69, 0.1)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(181, 134, 70, 0.22)',
      activeGlow: '0 0 15px rgba(181, 134, 70, 0.24)'
    }
  },
  map: {
    key: 'map',
    gradient: 'var(--color-primary-gradient)',
    hoverBackground: 'rgba(199, 143, 69, 0.1)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(107, 135, 151, 0.2)',
      activeGlow: '0 0 15px rgba(107, 135, 151, 0.24)'
    }
  },
  people: {
    key: 'people',
    gradient: 'var(--color-primary-gradient)',
    hoverBackground: 'rgba(199, 143, 69, 0.1)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(111, 140, 116, 0.22)',
      activeGlow: '0 0 15px rgba(111, 140, 116, 0.24)'
    }
  },
  culture: {
    key: 'culture',
    gradient: 'var(--color-primary-gradient)',
    hoverBackground: 'rgba(199, 143, 69, 0.1)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(140, 109, 130, 0.22)',
      activeGlow: '0 0 15px rgba(140, 109, 130, 0.24)'
    }
  },
  mythology: {
    key: 'mythology',
    gradient: 'var(--color-primary-gradient)',
    hoverBackground: 'rgba(199, 143, 69, 0.1)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(196, 146, 79, 0.22)',
      activeGlow: '0 0 15px rgba(196, 146, 79, 0.24)'
    }
  },
  events: {
    key: 'events',
    gradient: 'var(--color-primary-gradient)',
    hoverBackground: 'rgba(199, 143, 69, 0.1)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(107, 135, 151, 0.2)',
      activeGlow: '0 0 15px rgba(107, 135, 151, 0.24)'
    }
  },
  'emperors-cyber': {
    key: 'emperors-cyber',
    gradient: 'linear-gradient(135deg, #00f0ff 0%, #af52de 100%)',
    hoverBackground: 'rgba(0, 240, 255, 0.1)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(0, 240, 255, 0.22)',
      activeGlow: '0 0 15px rgba(0, 240, 255, 0.24)'
    }
  }
};

// 获取导航主题
export const getNavigationTheme = (key: string): NavigationTheme => {
  const theme = navigationThemes[key];
  return theme || navigationThemes['timeline']!;
};

// 颜色配置 - 对齐 CSS 变量值
export const colors = {
  // 主色调 - 对齐 CSS --color-primary
  primary: '#c78f45',
  primaryLight: '#e1b879',
  primaryDark: '#94652f',

  // 次要色 - 对齐 CSS --color-secondary
  secondary: '#6b8797',
  secondaryLight: '#97b4c6',
  secondaryDark: '#465c6a',

  // 功能色 - 对齐 CSS --color-success/warning/error/info
  success: '#7ea47d',
  warning: '#c89049',
  error: '#b76558',
  info: '#7595a9',

  // 中性色 - 保持不变
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },

  // 文本色 - 对齐 CSS --color-text-*
  text: {
    primary: '#f5ecd8',     // 暗色默认，createAppTheme 会根据 mode 覆盖
    secondary: '#d2c3a3',
    disabled: '#95856e'
  },

  // 背景色 - 对齐 CSS --color-bg-*
  background: {
    default: '#120f0d',     // 暗色默认，createAppTheme 会根据 mode 覆盖
    paper: '#211b16',
    hover: '#26211d',
    evenRow: 'rgba(var(--color-glass-surface-soft-rgb), 0.3)',
    dynastyCell: 'rgba(var(--color-success-rgb, 126, 164, 125), 0.15)',
    // 毛玻璃背景色
    glass: 'rgba(var(--color-glass-surface-rgb), 0.72)',
    glassDark: 'rgba(28, 24, 20, 0.72)',
    glassLight: 'rgba(244, 236, 223, 0.62)',
    glassHover: 'rgba(var(--color-glass-surface-rgb), 0.9)',
    glassActive: 'rgba(var(--color-glass-surface-rgb), 0.96)'
  },

  // 边框色 - 对齐 CSS --color-border-*
  border: {
    light: 'rgba(226, 198, 140, 0.12)',
    medium: 'rgba(226, 198, 140, 0.2)',
    dark: 'rgba(226, 198, 140, 0.34)',
    // 毛玻璃边框色
    glass: 'rgba(226, 198, 140, 0.16)',
    glassDark: 'rgba(226, 198, 140, 0.1)',
    glassLight: 'rgba(118, 90, 51, 0.14)'
  }
};

// 渐变配置 - 整合毛玻璃风格渐变
export const gradients = {
  primary: 'linear-gradient(135deg, #f3d29b 0%, #b6762b 100%)',
  secondary: 'linear-gradient(135deg, #adc2cf 0%, #587286 100%)',
  dynasties: 'linear-gradient(135deg, #c59b5b 0%, #8f5d24 100%)',
  people: 'linear-gradient(135deg, #91ab96 0%, #536957 100%)',
  culture: 'linear-gradient(135deg, #a98ea5 0%, #664b61 100%)',
  mythology: 'linear-gradient(135deg, #e4bf81 0%, #9d6327 100%)',
  events: 'linear-gradient(135deg, #9bb8c6 0%, #556f80 100%)',
  sidebar: 'linear-gradient(135deg, rgba(199,143,69,0.12) 0%, rgba(107,135,151,0.1) 100%)',
  sidebarHover: 'linear-gradient(135deg, rgba(199,143,69,0.2) 0%, rgba(107,135,151,0.16) 100%)',
  tableHeader: 'linear-gradient(135deg, #c59b5b 0%, #8f5d24 100%)',
  // 毛玻璃渐变
  glass: 'linear-gradient(135deg, rgba(255, 251, 243, 0.82) 0%, rgba(244, 236, 223, 0.56) 100%)',
  glassDark: 'linear-gradient(135deg, rgba(28, 24, 20, 0.8) 0%, rgba(43, 37, 31, 0.58) 100%)',
  glassShimmer: 'linear-gradient(90deg, transparent 0%, rgba(241, 199, 132, 0.12) 50%, transparent 100%)',
  glassOverlay: 'linear-gradient(180deg, rgba(241, 199, 132, 0.12) 0%, rgba(241, 199, 132, 0) 100%)'
};

// 阴影配置 - 更新为毛玻璃风格
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  glow: '0 0 20px rgba(199, 143, 69, 0.28)',
  glowBlue: '0 0 20px rgba(107, 135, 151, 0.24)',
  table: '0 4px 20px rgba(0,0,0,0.1)',
  // 毛玻璃阴影
  glass: {
    sm: '0 8px 18px rgba(0, 0, 0, 0.18)',
    md: '0 18px 36px rgba(0, 0, 0, 0.24)',
    lg: '0 28px 54px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(199, 143, 69, 0.16)',
    inset: 'inset 0 1px 1px rgba(245, 236, 216, 0.08)',
    // 组合阴影 - 毛玻璃深度效果
    card: '0 18px 36px rgba(0, 0, 0, 0.24), inset 0 1px 1px rgba(245, 236, 216, 0.08)',
    button: '0 8px 18px rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(245, 236, 216, 0.08)',
    nav: '0 24px 48px rgba(0, 0, 0, 0.28), inset 0 1px 1px rgba(245, 236, 216, 0.08)'
  }
};

// 圆角配置
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px'
};

// 过渡动画配置
export const transitions = {
  fast: '0.15s ease-in-out',
  normal: '0.3s ease-in-out',
  slow: '0.5s ease-in-out'
};

// 间距配置
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

// 字体配置
export const typography = {
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '"Noto Serif SC", "Source Han Serif SC", serif',
    mono: '"Fira Code", "Courier New", monospace'
  },
  fontSize: {
    xs: '0.65rem',
    sm: '0.7rem',
    base: '0.75rem',
    md: '0.8rem',
    lg: '0.85rem',
    xl: '0.9rem',
    xxl: '1rem'
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1,
    normal: 1.1,
    relaxed: 1.2,
    loose: 1.3
  }
};

// Z-index 层级配置
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070
};

// 毛玻璃主题配置
export const glassTheme = {
  // 获取当前配置（根据屏幕宽度）
  getConfig: (screenWidth?: number): GlassConfig => {
    return getGlassConfig(screenWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1024));
  },
  
  // 桌面端配置
  desktop: desktopConfig,
  
  // 移动端配置
  mobile: mobileConfig,
  
  // 毛玻璃背景样式
  backgrounds: {
    card: `rgba(255, 251, 243, ${desktopConfig.components.card.bgOpacity})`,
    navigation: `rgba(28, 24, 20, ${desktopConfig.components.navigation.bgOpacity})`,
    modal: `rgba(255, 251, 243, ${desktopConfig.components.modal.content.bgOpacity})`,
    tooltip: `rgba(28, 24, 20, ${desktopConfig.components.tooltip.bgOpacity})`,
    dropdown: `rgba(255, 251, 243, ${desktopConfig.components.dropdown.bgOpacity})`
  },
  
  // 毛玻璃模糊值
  blur: desktopConfig.blur,
  
  // 毛玻璃边框
  border: desktopConfig.border,
  
  // 毛玻璃阴影
  shadow: desktopConfig.shadow,
  
  // 毛玻璃动画
  animation: desktopConfig.animation
};

// 获取导航项毛玻璃样式
export const getNavigationGlassStyle = (key: string, isActive: boolean = false) => {
  const navTheme = getNavigationTheme(key);
  const config = glassTheme.getConfig();
  
  return {
    backdropFilter: `blur(${navTheme.glass.blur})`,
    WebkitBackdropFilter: `blur(${navTheme.glass.blur})`,
    backgroundColor: isActive 
      ? `rgba(255, 251, 243, ${navTheme.glass.bgOpacity + 0.1})`
      : `rgba(255, 251, 243, ${navTheme.glass.bgOpacity})`,
    border: `${config.border.width} solid ${navTheme.glass.borderColor}`,
    boxShadow: isActive ? navTheme.glass.activeGlow : config.shadow.sm,
    transition: `all ${config.animation.duration.normal} ${config.animation.easing}`
  };
};

// 导出默认主题
export const theme = {
  colors,
  gradients,
  shadows,
  borderRadius,
  transitions,
  spacing,
  typography,
  zIndex,
  navigationThemes,
  getNavigationTheme,
  dynastyColors,
  dynastyColorUtils,
  // 毛玻璃主题
  glass: glassTheme,
  getNavigationGlassStyle
};

export default theme;
