/**
 * 主题状态管理
 * Theme State Management
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 7.3
 * 
 * 使用 Zustand 管理主题状态，支持 localStorage 持久化
 */

import { create } from 'zustand';
import { 
  ThemeMode, 
  DEFAULT_THEME, 
  THEME_STORAGE_KEY, 
  isValidTheme 
} from '../config/themeConfig';

interface ThemeState {
  /** 当前主题模式 */
  theme: ThemeMode;
  /** 是否偏好减少动画 */
  prefersReducedMotion: boolean;
  /** 设置主题 */
  setTheme: (theme: ThemeMode) => void;
  /** 切换主题 */
  toggleTheme: () => void;
  /** 初始化主题（从 localStorage 恢复） */
  initializeTheme: () => void;
}

/**
 * 从 localStorage 获取保存的主题
 * Requirements: 1.2, 1.3
 */
function getSavedTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && isValidTheme(saved)) {
      return saved;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return DEFAULT_THEME;
}

/**
 * 保存主题到 localStorage
 * Requirements: 1.4
 */
function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
}

/**
 * 检测用户是否偏好减少动画
 * Requirements: 7.3
 */
function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 应用主题到 DOM
 * Requirements: 8.4
 */
function applyThemeToDOM(theme: ThemeMode): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

/**
 * 主题状态 Store
 * Requirements: 1.1, 1.2, 1.3, 1.4, 7.3
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getSavedTheme(),
  prefersReducedMotion: detectReducedMotion(),
  
  setTheme: (theme: ThemeMode) => {
    if (!isValidTheme(theme)) {
      console.warn(`Invalid theme value: ${theme}`);
      return;
    }
    saveTheme(theme);
    applyThemeToDOM(theme);
    set({ theme });
  },
  
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';
    saveTheme(newTheme);
    applyThemeToDOM(newTheme);
    set({ theme: newTheme });
  },
  
  initializeTheme: () => {
    const theme = getSavedTheme();
    const prefersReducedMotion = detectReducedMotion();
    applyThemeToDOM(theme);
    set({ theme, prefersReducedMotion });
  },
}));

/**
 * 初始化主题的 Hook
 * 在应用启动时调用一次
 */
export function initializeTheme(): void {
  const theme = getSavedTheme();
  applyThemeToDOM(theme);
}
