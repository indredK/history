/**
 * 主题配置文件
 * 统一管理应用的颜色、渐变、阴影等主题相关配置
 */

// 导航菜单主题配置
export interface NavigationTheme {
  key: string;
  gradient: string;
  hoverBackground: string;
}

// 导航菜单主题映射
export const navigationThemes: Record<string, NavigationTheme> = {
  timeline: {
    key: 'timeline',
    gradient: 'var(--color-primary-gradient)',
    hoverBackground: 'rgba(255, 61, 0, 0.1)'
  },
  dynasties: {
    key: 'dynasties',
    gradient: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
    hoverBackground: 'rgba(211, 47, 47, 0.1)'
  },
  map: {
    key: 'map',
    gradient: 'var(--color-secondary-gradient)',
    hoverBackground: 'rgba(3, 169, 244, 0.1)'
  },
  people: {
    key: 'people',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
    hoverBackground: 'rgba(76, 175, 80, 0.1)'
  },
  culture: {
    key: 'culture',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
    hoverBackground: 'rgba(156, 39, 176, 0.1)'
  },
  mythology: {
    key: 'mythology',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
    hoverBackground: 'rgba(255, 152, 0, 0.1)'
  },
  events: {
    key: 'events',
    gradient: 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)',
    hoverBackground: 'rgba(96, 125, 139, 0.1)'
  }
};

// 获取导航主题
export const getNavigationTheme = (key: string): NavigationTheme => {
  const theme = navigationThemes[key];
  return theme || navigationThemes['timeline']!;
};

// 颜色配置
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
  
  // 背景色
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    hover: '#F8F9FA',
    evenRow: '#FAFAFA',
    dynastyCell: '#E8F5E8'
  },
  
  // 边框色
  border: {
    light: '#E0E0E0',
    medium: '#E3F2FD',
    dark: '#BDBDBD'
  }
};

// 渐变配置
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
  tableHeader: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
};

// 阴影配置
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  glow: '0 0 20px rgba(255, 61, 0, 0.5)',
  glowBlue: '0 0 20px rgba(3, 169, 244, 0.5)',
  table: '0 4px 20px rgba(0,0,0,0.1)'
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
  }
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
  dynastyColorUtils
};

export default theme;