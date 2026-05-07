import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorage } from './storage';

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
      warnSpy.mockRestore();
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
  });

  describe('remove', () => {
    it('should remove item from storage', () => {
      localStorage.setItem('toRemove', 'value');
      LocalStorage.remove('toRemove');
      expect(localStorage.getItem('toRemove')).toBeNull();
    });
  });
});
