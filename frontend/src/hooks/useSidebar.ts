import { useState, useEffect, useCallback } from 'react';
import { sidebarStorage, StorageListener, STORAGE_KEYS } from '@/utils/storage';

/**
 * 侧边栏状态管理 Hook
 * 提供侧边栏收起/展开状态的管理，并自动同步到 localStorage
 * 支持跨标签页状态同步
 */
export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const initialState = sidebarStorage.getCollapsed();
    console.debug('Sidebar initial state loaded from localStorage:', initialState);
    return initialState;
  });

  // 切换侧边栏状态
  const toggle = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  // 设置侧边栏状态
  const setCollapsedState = useCallback((newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
  }, []);

  // 展开侧边栏
  const expand = useCallback(() => {
    setCollapsed(false);
  }, []);

  // 收起侧边栏
  const collapse = useCallback(() => {
    setCollapsed(true);
  }, []);

  // 监听状态变化，自动保存到 localStorage
  useEffect(() => {
    sidebarStorage.setCollapsed(collapsed);
    console.debug('Sidebar state saved to localStorage:', collapsed);
  }, [collapsed]);

  // 监听跨标签页的状态变化
  useEffect(() => {
    const handleStorageChange = (key: string, newValue: boolean) => {
      if (key === STORAGE_KEYS.SIDEBAR_COLLAPSED && newValue !== collapsed) {
        console.debug('Sidebar state synced from another tab:', newValue);
        setCollapsed(newValue);
      }
    };

    StorageListener.addListener(STORAGE_KEYS.SIDEBAR_COLLAPSED, handleStorageChange);

    return () => {
      StorageListener.removeListener(STORAGE_KEYS.SIDEBAR_COLLAPSED, handleStorageChange);
    };
  }, [collapsed]);

  return {
    collapsed,
    toggle,
    setCollapsed: setCollapsedState,
    expand,
    collapse,
  };
}