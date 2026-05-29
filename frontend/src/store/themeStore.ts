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
import {
  applyThemeToDOM,
  bindStorageSync,
  readStoredMode,
  runRootTransition,
  writeStoredMode,
} from '@/theme/domAppearance';

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

let detachThemeStorageSync: (() => void) | null = null;

/**
 * 从 localStorage 获取保存的主题
 * Requirements: 1.2, 1.3
 */
function getSavedTheme(): ThemeMode {
  return readStoredMode(THEME_STORAGE_KEY, isValidTheme, DEFAULT_THEME);
}

/**
 * 保存主题到 localStorage
 * Requirements: 1.4
 */
function saveTheme(theme: ThemeMode): void {
  writeStoredMode(THEME_STORAGE_KEY, theme);
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
function ensureThemeStorageSync(setTheme: (theme: ThemeMode) => void): void {
  if (detachThemeStorageSync) {
    return;
  }

  detachThemeStorageSync = bindStorageSync(THEME_STORAGE_KEY, isValidTheme, setTheme);
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
    runRootTransition('theme-transitioning', () => {
      saveTheme(theme);
      applyThemeToDOM(theme);
      set({ theme });
    });
  },
  
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';
    runRootTransition('theme-transitioning', () => {
      saveTheme(newTheme);
      applyThemeToDOM(newTheme);
      set({ theme: newTheme });
    });
  },
  
  initializeTheme: () => {
    const theme = getSavedTheme();
    const prefersReducedMotion = detectReducedMotion();
    applyThemeToDOM(theme);
    ensureThemeStorageSync((nextTheme) => {
      applyThemeToDOM(nextTheme);
      set({ theme: nextTheme });
    });
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
  ensureThemeStorageSync((nextTheme) => {
    applyThemeToDOM(nextTheme);
    useThemeStore.setState({ theme: nextTheme });
  });
}
