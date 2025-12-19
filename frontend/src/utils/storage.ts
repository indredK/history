/**
 * localStorage 工具函数
 * 提供类型安全的本地存储操作
 */

export class LocalStorage {
  /**
   * 获取存储的值
   * @param key 存储键
   * @param defaultValue 默认值
   * @returns 存储的值或默认值
   */
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Failed to get item from localStorage with key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * 设置存储的值
   * @param key 存储键
   * @param value 要存储的值
   */
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to set item to localStorage with key "${key}":`, error);
    }
  }

  /**
   * 删除存储的值
   * @param key 存储键
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove item from localStorage with key "${key}":`, error);
    }
  }

  /**
   * 清空所有存储
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * 检查是否支持 localStorage
   */
  static isSupported(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 存储键常量
 */
export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  SELECTED_DYNASTY: 'selected-dynasty',
  THEME_MODE: 'theme-mode',
  USER_PREFERENCES: 'user-preferences',
  DYNASTIES_EXPANDED: 'dynasties-expanded',
} as const;

/**
 * 侧边栏状态管理
 */
export const sidebarStorage = {
  getCollapsed: (): boolean => LocalStorage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
  setCollapsed: (collapsed: boolean): void => LocalStorage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed),
};

/**
 * 朝代展开状态管理
 */
export const dynastiesStorage = {
  getExpanded: (): Record<string, boolean> => LocalStorage.get(STORAGE_KEYS.DYNASTIES_EXPANDED, {}),
  setExpanded: (expanded: Record<string, boolean>): void => LocalStorage.set(STORAGE_KEYS.DYNASTIES_EXPANDED, expanded),
  getDynastyExpanded: (dynastyId: string): boolean => {
    const expanded: Record<string, boolean> = LocalStorage.get(STORAGE_KEYS.DYNASTIES_EXPANDED, {});
    return expanded[dynastyId] !== false; // 默认展开
  },
  setDynastyExpanded: (dynastyId: string, expanded: boolean): void => {
    const current: Record<string, boolean> = LocalStorage.get(STORAGE_KEYS.DYNASTIES_EXPANDED, {});
    LocalStorage.set(STORAGE_KEYS.DYNASTIES_EXPANDED, { ...current, [dynastyId]: expanded });
  },
};

/**
 * 存储事件监听器类型
 */
export type StorageEventListener = (key: string, newValue: any, oldValue: any) => void;

/**
 * 存储变化监听器
 * 用于监听 localStorage 的变化（跨标签页同步）
 */
export class StorageListener {
  private static listeners: Map<string, Set<StorageEventListener>> = new Map();

  /**
   * 添加存储变化监听器
   * @param key 存储键
   * @param listener 监听器函数
   */
  static addListener(key: string, listener: StorageEventListener): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // 如果是第一个监听器，添加全局 storage 事件监听
    if (this.getTotalListenerCount() === 1) {
      window.addEventListener('storage', this.handleStorageEvent);
    }
  }

  /**
   * 移除存储变化监听器
   * @param key 存储键
   * @param listener 监听器函数
   */
  static removeListener(key: string, listener: StorageEventListener): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.delete(listener);
      if (keyListeners.size === 0) {
        this.listeners.delete(key);
      }
    }

    // 如果没有监听器了，移除全局 storage 事件监听
    if (this.getTotalListenerCount() === 0) {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
  }

  /**
   * 处理 storage 事件
   */
  private static handleStorageEvent = (event: StorageEvent): void => {
    if (!event.key) return;

    const keyListeners = this.listeners.get(event.key);
    if (keyListeners) {
      const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
      const newValue = event.newValue ? JSON.parse(event.newValue) : null;
      
      keyListeners.forEach(listener => {
        try {
          listener(event.key!, newValue, oldValue);
        } catch (error) {
          console.warn('Error in storage listener:', error);
        }
      });
    }
  };

  /**
   * 获取总监听器数量
   */
  private static getTotalListenerCount(): number {
    let count = 0;
    this.listeners.forEach(listeners => {
      count += listeners.size;
    });
    return count;
  }
}