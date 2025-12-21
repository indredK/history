/**
 * 主题配置文件
 * Theme Configuration
 * 
 * Requirements: 2.1, 2.2, 2.4, 3.1, 3.2, 3.4
 * 
 * 定义暗黑模式和白天模式的颜色配置
 */

/** 主题模式类型 */
export type ThemeMode = 'dark' | 'light';

/** 毛玻璃效果颜色配置 */
export interface GlassColors {
  /** 背景颜色基础值 (不含透明度) */
  bgBase: string;
  /** 背景透明度 */
  bgOpacity: number;
  /** 边框颜色 */
  borderColor: string;
  /** 文字颜色 */
  textColor: string;
  /** 次要文字颜色 */
  textSecondary: string;
  /** 悬停时的背景透明度增量 */
  hoverOpacityDelta: number;
}

/** UI 颜色配置 */
export interface UIColors {
  /** 主背景色 */
  background: string;
  /** 表面颜色 */
  surface: string;
  /** 主文字颜色 */
  text: string;
  /** 次要文字颜色 */
  textSecondary: string;
  /** 禁用文字颜色 */
  textMuted: string;
  /** 边框颜色 */
  border: string;
  /** 分割线颜色 */
  divider: string;
}

/** 主题颜色配置 */
export interface ThemeColors {
  glass: GlassColors;
  ui: UIColors;
}

/** 主题配置 */
export interface ThemeConfig {
  dark: ThemeColors;
  light: ThemeColors;
}

/**
 * 暗黑模式颜色配置
 * Requirements: 2.1, 2.2, 2.4
 */
const darkTheme: ThemeColors = {
  glass: {
    bgBase: '30, 30, 30',           // rgba(30, 30, 30, opacity)
    bgOpacity: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    textColor: 'rgba(255, 255, 255, 0.95)',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    hoverOpacityDelta: 0.1,
  },
  ui: {
    background: 'rgba(20, 20, 20, 1)',
    surface: 'rgba(30, 30, 30, 1)',
    text: 'rgba(255, 255, 255, 0.95)',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(255, 255, 255, 0.15)',
    divider: 'rgba(255, 255, 255, 0.1)',
  },
};

/**
 * 白天模式颜色配置
 * Requirements: 3.1, 3.2, 3.4
 */
const lightTheme: ThemeColors = {
  glass: {
    bgBase: '255, 255, 255',        // rgba(255, 255, 255, opacity)
    bgOpacity: 0.7,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    textColor: 'rgba(0, 0, 0, 0.87)',
    textSecondary: 'rgba(0, 0, 0, 0.6)',
    hoverOpacityDelta: 0.1,
  },
  ui: {
    background: 'rgba(245, 245, 245, 1)',
    surface: 'rgba(255, 255, 255, 1)',
    text: 'rgba(0, 0, 0, 0.87)',
    textSecondary: 'rgba(0, 0, 0, 0.6)',
    textMuted: 'rgba(0, 0, 0, 0.38)',
    border: 'rgba(0, 0, 0, 0.12)',
    divider: 'rgba(0, 0, 0, 0.08)',
  },
};

/** 主题配置对象 */
export const themeConfig: ThemeConfig = {
  dark: darkTheme,
  light: lightTheme,
};

/**
 * 根据主题模式获取颜色配置
 * @param theme - 主题模式
 * @returns 对应的颜色配置
 */
export function getThemeColors(theme: ThemeMode): ThemeColors {
  return themeConfig[theme];
}

/**
 * 获取毛玻璃背景颜色（带透明度）
 * @param theme - 主题模式
 * @param opacity - 可选的自定义透明度
 * @returns rgba 格式的背景颜色
 */
export function getGlassBackground(theme: ThemeMode, opacity?: number): string {
  const colors = getThemeColors(theme);
  const finalOpacity = opacity ?? colors.glass.bgOpacity;
  return `rgba(${colors.glass.bgBase}, ${finalOpacity})`;
}

/**
 * 检查是否为有效的主题模式
 * @param value - 要检查的值
 * @returns 是否为有效主题模式
 */
export function isValidTheme(value: unknown): value is ThemeMode {
  return value === 'dark' || value === 'light';
}

/** 默认主题 */
export const DEFAULT_THEME: ThemeMode = 'dark';

/** localStorage 存储键 */
export const THEME_STORAGE_KEY = 'app-theme';
