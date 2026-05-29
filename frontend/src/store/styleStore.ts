/**
 * 样式状态管理
 * Style State Management
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 * 
 * 使用 Zustand 管理样式状态，支持 localStorage 持久化
 */

import { create } from 'zustand';
import { 
  StyleMode, 
  DEFAULT_STYLE, 
  STYLE_STORAGE_KEY, 
  isValidStyle 
} from '../config/styles/types';
import {
  applyStyleToDOM,
  bindStorageSync,
  readStoredMode,
  runRootTransition,
  writeStoredMode,
} from '@/theme/domAppearance';

interface StyleState {
  /** 当前样式模式 */
  style: StyleMode;
  /** 设置样式 */
  setStyle: (style: StyleMode) => void;
  /** 切换样式 */
  toggleStyle: () => void;
  /** 初始化样式（从 localStorage 恢复） */
  initializeStyle: () => void;
}

let detachStyleStorageSync: (() => void) | null = null;

/**
 * 从 localStorage 获取保存的样式
 * Requirements: 2.2, 2.3
 */
function getSavedStyle(): StyleMode {
  return readStoredMode(STYLE_STORAGE_KEY, isValidStyle, DEFAULT_STYLE);
}

/**
 * 保存样式到 localStorage
 * Requirements: 2.4
 */
function saveStyle(style: StyleMode): void {
  writeStoredMode(STYLE_STORAGE_KEY, style);
}

/**
 * 应用样式到 DOM
 * Requirements: 2.6
 */
function ensureStyleStorageSync(setStyle: (style: StyleMode) => void): void {
  if (detachStyleStorageSync) {
    return;
  }

  detachStyleStorageSync = bindStorageSync(STYLE_STORAGE_KEY, isValidStyle, setStyle);
}

/**
 * 样式状态 Store
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
export const useStyleStore = create<StyleState>((set, get) => ({
  style: getSavedStyle(),
  
  setStyle: (style: StyleMode) => {
    if (!isValidStyle(style)) {
      console.warn(`Invalid style value: ${style}`);
      return;
    }
    runRootTransition('style-transitioning', () => {
      saveStyle(style);
      applyStyleToDOM(style);
      set({ style });
    });
  },
  
  toggleStyle: () => {
    const currentStyle = get().style;
    const newStyle: StyleMode = currentStyle === 'glass' ? 'classic' : 'glass';
    runRootTransition('style-transitioning', () => {
      saveStyle(newStyle);
      applyStyleToDOM(newStyle);
      set({ style: newStyle });
    });
  },
  
  initializeStyle: () => {
    const style = getSavedStyle();
    applyStyleToDOM(style);
    ensureStyleStorageSync((nextStyle) => {
      applyStyleToDOM(nextStyle);
      set({ style: nextStyle });
    });
    set({ style });
  },
}));

/**
 * 初始化样式的函数
 * 在应用启动时调用一次
 */
export function initializeStyle(): void {
  const style = getSavedStyle();
  applyStyleToDOM(style);
  ensureStyleStorageSync((nextStyle) => {
    applyStyleToDOM(nextStyle);
    useStyleStore.setState({ style: nextStyle });
  });
}
