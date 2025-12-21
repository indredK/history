/**
 * 主题配置文件
 * 统一管理应用的颜色、渐变、阴影等主题相关配置
 * 
 * Requirements: 6.5, 11.3
 * 整合毛玻璃配置到主题系统
 */

import { desktopConfig, mobileConfig, getGlassConfig } from './glassConfig';
import type { GlassConfig } from './glassConfig.types';

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
    hoverBackground: 'rgba(255, 61, 0, 0.15)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(255, 61, 0, 0.2)',
      activeGlow: '0 0 15px rgba(255, 61, 0, 0.3)'
    }
  },
  dynasties: {
    key: 'dynasties',
    gradient: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
    hoverBackground: 'rgba(211, 47, 47, 0.15)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(211, 47, 47, 0.2)',
      activeGlow: '0 0 15px rgba(211, 47, 47, 0.3)'
    }
  },
  map: {
    key: 'map',
    gradient: 'var(--color-secondary-gradient)',
    hoverBackground: 'rgba(3, 169, 244, 0.15)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(3, 169, 244, 0.2)',
      activeGlow: '0 0 15px rgba(3, 169, 244, 0.3)'
    }
  },
  people: {
    key: 'people',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
    hoverBackground: 'rgba(76, 175, 80, 0.15)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(76, 175, 80, 0.2)',
      activeGlow: '0 0 15px rgba(76, 175, 80, 0.3)'
    }
  },
  culture: {
    key: 'culture',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
    hoverBackground: 'rgba(156, 39, 176, 0.15)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(156, 39, 176, 0.2)',
      activeGlow: '0 0 15px rgba(156, 39, 176, 0.3)'
    }
  },
  mythology: {
    key: 'mythology',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
    hoverBackground: 'rgba(255, 152, 0, 0.15)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(255, 152, 0, 0.2)',
      activeGlow: '0 0 15px rgba(255, 152, 0, 0.3)'
    }
  },
  events: {
    key: 'events',
    gradient: 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)',
    hoverBackground: 'rgba(96, 125, 139, 0.15)',
    glass: {
      blur: '20px',
      bgOpacity: 0.7,
      borderColor: 'rgba(96, 125, 139, 0.2)',
      activeGlow: '0 0 15px rgba(96, 125, 139, 0.3)'
    }
  }
};

// 获取导航主题
export const getNavigationTheme = (key: string): NavigationTheme => {
  const theme = navigationThemes[key];
  return theme || navigationThemes['timeline']!;
};

// 颜色配置 - 更新为毛玻璃友好的半透明色
export const colors = {
  // 主色调
  primary: '#FF3D00',
  primaryLight: '#FF6F3D',
  primaryDark: '#E63900',
  
  // 次要色
  secondary: '#03A9F4',
  secondaryLight: '#4FC3F7',
  secondaryDark: '#0288D1',
  
  // 功能色
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // 中性色
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
  
  // 文本色
  text: {
    primary: '#999',
    secondary: '#666',
    disabled: '#BDBDBD'
  },
  
  // 背景色 - 毛玻璃友好的半透明色
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    hover: '#F8F9FA',
    evenRow: '#FAFAFA',
    dynastyCell: '#E8F5E8',
    // 毛玻璃背景色
    glass: 'rgba(255, 255, 255, 0.6)',
    glassDark: 'rgba(30, 30, 30, 0.7)',
    glassLight: 'rgba(255, 255, 255, 0.3)',
    glassHover: 'rgba(255, 255, 255, 0.75)',
    glassActive: 'rgba(255, 255, 255, 0.85)'
  },
  
  // 边框色 - 毛玻璃友好的半透明色
  border: {
    light: '#E0E0E0',
    medium: '#E3F2FD',
    dark: '#BDBDBD',
    // 毛玻璃边框色
    glass: 'rgba(255, 255, 255, 0.18)',
    glassDark: 'rgba(255, 255, 255, 0.1)',
    glassLight: 'rgba(255, 255, 255, 0.25)'
  }
};

// 渐变配置 - 整合毛玻璃风格渐变
export const gradients = {
  primary: 'linear-gradient(135deg, #FF3D00 0%, #FF6F3D 100%)',
  secondary: 'linear-gradient(135deg, #03A9F4 0%, #4FC3F7 100%)',
  dynasties: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
  people: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
  culture: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
  mythology: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
  events: 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)',
  sidebar: 'linear-gradient(135deg, rgba(255,61,0,0.1) 0%, rgba(3,169,244,0.1) 100%)',
  sidebarHover: 'linear-gradient(135deg, rgba(255,61,0,0.2) 0%, rgba(3,169,244,0.2) 100%)',
  tableHeader: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  // 毛玻璃渐变
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%)',
  glassDark: 'linear-gradient(135deg, rgba(30, 30, 30, 0.7) 0%, rgba(30, 30, 30, 0.5) 100%)',
  glassShimmer: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
  glassOverlay: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%)'
};

// 阴影配置 - 更新为毛玻璃风格
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  glow: '0 0 20px rgba(255, 61, 0, 0.5)',
  glowBlue: '0 0 20px rgba(3, 169, 244, 0.5)',
  table: '0 4px 20px rgba(0,0,0,0.1)',
  // 毛玻璃阴影
  glass: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.15)',
    glow: '0 0 20px rgba(255, 255, 255, 0.1)',
    inset: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
    // 组合阴影 - 毛玻璃深度效果
    card: '0 4px 16px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
    button: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
    nav: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
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

// 朝代颜色配置
export const dynastyColors = {
  // 默认朝代颜色
  default: '#8B4513',
  
  // 朝代颜色透明度配置
  alphaLevels: {
    background: 0.12,
    gradient1: 0.15,
    gradient2: 0.08,
    card: 0.6,
    cardActive: 1.0,
    border: 0.4,
    glow: 0.3,
    shimmer: 0.1
  },
  
  // 朝代相关的渐变配置
  gradientSuffixes: {
    light: 'cc', // 80% opacity
    medium: '88', // 53% opacity
    dark: '66'    // 40% opacity
  }
};

// 朝代颜色工具函数
export const dynastyColorUtils = {
  // 将朝代颜色转换为rgba格式
  getDynastyColorWithAlpha: (color: string | undefined, alpha: number): string => {
    if (!color) return `rgba(139, 69, 19, ${alpha})`;
    
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return color;
  },
  
  // 获取朝代渐变色
  getDynastyGradient: (color: string | undefined, suffix: keyof typeof dynastyColors.gradientSuffixes = 'light'): string => {
    const dynastyColor = color || dynastyColors.default;
    const suffixValue = dynastyColors.gradientSuffixes[suffix];
    return `linear-gradient(135deg, ${dynastyColor}${suffixValue}, ${dynastyColor}${dynastyColors.gradientSuffixes.medium})`;
  },
  
  // 获取朝代发光效果
  getDynastyGlow: (color: string | undefined, intensity: number = 0.3): string => {
    const dynastyColor = color || dynastyColors.default;
    return `0 0 20px ${dynastyColorUtils.getDynastyColorWithAlpha(dynastyColor, intensity)}`;
  },
  
  // 获取朝代毛玻璃背景色
  getDynastyGlassBackground: (color: string | undefined, opacity: number = 0.6): string => {
    return dynastyColorUtils.getDynastyColorWithAlpha(color, opacity);
  }
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
    card: `rgba(255, 255, 255, ${desktopConfig.components.card.bgOpacity})`,
    navigation: `rgba(255, 255, 255, ${desktopConfig.components.navigation.bgOpacity})`,
    modal: `rgba(255, 255, 255, ${desktopConfig.components.modal.content.bgOpacity})`,
    tooltip: `rgba(255, 255, 255, ${desktopConfig.components.tooltip.bgOpacity})`,
    dropdown: `rgba(255, 255, 255, ${desktopConfig.components.dropdown.bgOpacity})`
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
      ? `rgba(255, 255, 255, ${navTheme.glass.bgOpacity + 0.1})`
      : `rgba(255, 255, 255, ${navTheme.glass.bgOpacity})`,
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