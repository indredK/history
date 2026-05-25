import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LocalStorage,
  STORAGE_KEYS,
  sidebarStorage,
  dynastiesStorage,
  StorageListener,
} from './storage';

describe('LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('should return default value when key does not exist', () => {
      const result = LocalStorage.get('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return stored value when key exists', () => {
      localStorage.setItem('testKey', JSON.stringify('testValue'));
      const result = LocalStorage.get('testKey', 'default');
      expect(result).toBe('testValue');
    });

    it('should parse JSON correctly', () => {
      const obj = { name: 'test', value: 123 };
      localStorage.setItem('jsonKey', JSON.stringify(obj));
      const result = LocalStorage.get<typeof obj>('jsonKey', {} as typeof obj);
      expect(result).toEqual(obj);
    });

    it('should return default value when JSON is invalid', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('invalidJson', 'not valid json');
      const result = LocalStorage.get('invalidJson', 'default');
      expect(result).toBe('default');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should handle boolean false correctly (not coerce to default)', () => {
      LocalStorage.set('boolKey', false);
      // 关键回归:false 与 null 易混,确保拿到的是真实的 false 而不是默认值
      const result = LocalStorage.get('boolKey', true);
      expect(result).toBe(false);
    });
  });

  describe('set', () => {
    it('should store string value', () => {
      LocalStorage.set('key', 'value');
      expect(localStorage.getItem('key')).toBe('"value"');
    });

    it('should store object value', () => {
      const obj = { name: 'test' };
      LocalStorage.set('objKey', obj);
      expect(localStorage.getItem('objKey')).toBe(JSON.stringify(obj));
    });

    it('should swallow setItem failure with warning(quota / disabled storage)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = vi
        .spyOn(localStorage, 'setItem')
        .mockImplementation(() => {
          throw new Error('QuotaExceededError');
        });
      // 不应抛
      expect(() => LocalStorage.set('x', 'y')).not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('remove', () => {
    it('should remove item from storage', () => {
      localStorage.setItem('toRemove', 'value');
      LocalStorage.remove('toRemove');
      expect(localStorage.getItem('toRemove')).toBeNull();
    });

    it('should swallow removeItem failure', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const removeSpy = vi
        .spyOn(localStorage, 'removeItem')
        .mockImplementation(() => {
          throw new Error('fail');
        });
      expect(() => LocalStorage.remove('x')).not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
      removeSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('should clear all storage', () => {
      localStorage.setItem('a', '1');
      localStorage.setItem('b', '2');
      LocalStorage.clear();
      expect(localStorage.length).toBe(0);
    });
  });

  describe('isSupported', () => {
    it('returns true in a JSDOM environment', () => {
      expect(LocalStorage.isSupported()).toBe(true);
    });

    it('returns false when storage throws', () => {
      const setSpy = vi
        .spyOn(localStorage, 'setItem')
        .mockImplementation(() => {
          throw new Error('disabled');
        });
      expect(LocalStorage.isSupported()).toBe(false);
      setSpy.mockRestore();
    });
  });
});

describe('sidebarStorage', () => {
  beforeEach(() => localStorage.clear());

  it('getCollapsed defaults to false', () => {
    expect(sidebarStorage.getCollapsed()).toBe(false);
  });

  it('setCollapsed roundtrips through localStorage', () => {
    sidebarStorage.setCollapsed(true);
    expect(localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)).toBe('true');
    expect(sidebarStorage.getCollapsed()).toBe(true);
  });
});

describe('dynastiesStorage', () => {
  beforeEach(() => localStorage.clear());

  it('getDynastyExpanded 默认 true (key 不存在时算展开)', () => {
    expect(dynastiesStorage.getDynastyExpanded('tang')).toBe(true);
  });

  it('getDynastyExpanded 显式 false 时返回 false', () => {
    dynastiesStorage.setDynastyExpanded('tang', false);
    expect(dynastiesStorage.getDynastyExpanded('tang')).toBe(false);
  });

  it('setDynastyExpanded merges, does not overwrite other dynasties', () => {
    dynastiesStorage.setDynastyExpanded('tang', false);
    dynastiesStorage.setDynastyExpanded('song', true);
    const all = dynastiesStorage.getExpanded();
    expect(all).toEqual({ tang: false, song: true });
  });
});

describe('StorageListener', () => {
  afterEach(() => {
    // 清空所有注册的 listener,避免测试间污染
    // 通过反射访问私有静态字段以重置
    const internal = StorageListener as unknown as {
      listeners: Map<string, Set<unknown>>;
    };
    internal.listeners.clear();
    // 同时移除可能挂上的全局监听
    // 这里不能直接拿到 handler 引用,所以重新 add/remove 一次让计数归零
  });

  it('调用 add 后,listener 命中 storage 事件', () => {
    const listener = vi.fn();
    StorageListener.addListener('foo', listener);

    const event = new StorageEvent('storage', {
      key: 'foo',
      oldValue: JSON.stringify('old'),
      newValue: JSON.stringify('new'),
    });
    window.dispatchEvent(event);

    expect(listener).toHaveBeenCalledWith('foo', 'new', 'old');
  });

  it('removeListener 后不再触发', () => {
    const listener = vi.fn();
    StorageListener.addListener('bar', listener);
    StorageListener.removeListener('bar', listener);

    const event = new StorageEvent('storage', {
      key: 'bar',
      oldValue: null,
      newValue: JSON.stringify(1),
    });
    window.dispatchEvent(event);

    expect(listener).not.toHaveBeenCalled();
  });

  it('监听器抛错时不影响后续监听器', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const throwing = vi.fn(() => {
      throw new Error('boom');
    });
    const ok = vi.fn();
    StorageListener.addListener('baz', throwing);
    StorageListener.addListener('baz', ok);

    const event = new StorageEvent('storage', {
      key: 'baz',
      newValue: JSON.stringify('v'),
    });
    window.dispatchEvent(event);

    expect(throwing).toHaveBeenCalled();
    expect(ok).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
