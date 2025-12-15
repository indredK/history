import { useState, useEffect, useCallback, useRef } from 'react';

export interface FetchOptions {
  cacheKey?: string;
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  // 新增功能
  debounceWait?: number; // 防抖等待时间
  throttleWait?: number; // 节流等待时间
  retryCount?: number; // 重试次数
  retryInterval?: number; // 重试间隔
  staleWhileRevalidate?: boolean; // 是否启用 SWR 模式
  cancelPrevious?: boolean; // 是否取消上一个请求
  cacheTime?: number; // 缓存有效期（毫秒）
}

export interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  // 新增功能
  cancel: () => void; // 取消请求
  isRefetching: boolean; // 是否正在重新请求
  retryCount: number; // 当前重试次数
}

// 带过期时间的缓存项
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// 简单的内存缓存
const cache = new Map<string, CacheItem<any>>();

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
}

export function useDataFetch<T>(
  fetchFn: () => Promise<{ data: T }>,
  options: FetchOptions = {}
): FetchResult<T> {
  // 解构出需要的选项，避免直接依赖整个 options 对象
  const { 
    refetchInterval, 
    debounceWait, 
    throttleWait, 
    retryCount = 0,
    retryInterval = 1000,
    staleWhileRevalidate = false,
    cancelPrevious = true,
    cacheTime = 5 * 60 * 1000 // 默认缓存 5 分钟
  } = options;
  
  // 使用 useRef 稳定化 options 和 fetchFn，避免每次渲染都创建新的依赖
  const optionsRef = useRef(options);
  optionsRef.current = options;
  
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [currentRetryCount, setCurrentRetryCount] = useState<number>(0);

  // 用于取消请求的控制器
  const abortControllerRef = useRef<AbortController | null>(null);
  // 用于跟踪当前请求的 Promise
  const currentRequestRef = useRef<Promise<void> | null>(null);
  // 用于跟踪上一个请求的 Promise
  const previousRequestRef = useRef<Promise<void> | null>(null);

  const fetchData = useCallback(async (isRefetch = false) => {
    const { enabled = true, cacheKey, onSuccess, onError } = optionsRef.current;
    
    if (!enabled) return;

    // 如果需要取消上一个请求
    if (cancelPrevious && previousRequestRef.current) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    // 创建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // 设置加载状态
    if (isRefetch) {
      setIsRefetching(true);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
      setCurrentRetryCount(0);
    }

    // 检查缓存
    if (cacheKey && cache.has(cacheKey)) {
      const cacheItem = cache.get(cacheKey);
      if (cacheItem) {
        const isExpired = Date.now() - cacheItem.timestamp > cacheTime;
        
        if (!isExpired) {
          setData(cacheItem.data);
          onSuccess?.(cacheItem.data);
          if (isRefetch) {
            setIsRefetching(false);
          } else {
            setLoading(false);
          }
          return;
        } else if (staleWhileRevalidate) {
          // SWR 模式：返回过期数据，同时在后台重新获取
          setData(cacheItem.data);
          onSuccess?.(cacheItem.data);
        }
      }
    }

    let retries = 0;
    const maxRetries = retryCount;
    
    const requestPromise = (async () => {
      while (retries <= maxRetries) {
        try {
          // 创建一个包装了 fetchFn 的函数，支持 AbortController
          const fetchWithAbort = async () => {
            const result = await fetchFnRef.current();
            // 检查请求是否已被取消
            if (abortController.signal.aborted) {
              throw new Error('Request aborted');
            }
            return result;
          };

          const result = await fetchWithAbort();
          const newData = result.data;
          
          // 更新缓存
          if (cacheKey) {
            cache.set(cacheKey, { data: newData, timestamp: Date.now() });
          }

          setData(newData);
          onSuccess?.(newData);
          break;
        } catch (err) {
          retries++;
          setCurrentRetryCount(retries);
          
          if (retries > maxRetries || (abortController.signal.aborted && err instanceof Error && err.name === 'AbortError')) {
            const error = err instanceof Error ? err : new Error('Unknown error occurred');
            setError(error);
            onError?.(error);
            if (err instanceof Error && err.name !== 'AbortError') {
              console.error('Data fetch error:', error);
            }
            break;
          }
          
          // 重试间隔
          await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
      }

      if (isRefetch) {
        setIsRefetching(false);
      } else {
        setLoading(false);
      }
    })();

    // 保存当前请求
    currentRequestRef.current = requestPromise;
    // 设置上一个请求
    previousRequestRef.current = requestPromise;
    
    try {
      await requestPromise;
    } catch (err) {
      // 请求被取消时不抛出错误
      if (!(err instanceof Error && err.name === 'AbortError')) {
        throw err;
      }
    } finally {
      // 清除当前请求引用
      if (currentRequestRef.current === requestPromise) {
        currentRequestRef.current = null;
      }
    }
  }, [retryCount, retryInterval, cacheTime, staleWhileRevalidate, cancelPrevious]);

  // 取消请求
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // 根据配置创建防抖或节流版本的 fetchData
  const debouncedFetchData = useCallback(
    debounceWait ? debounce(fetchData, debounceWait) : fetchData,
    [fetchData, debounceWait]
  );

  const throttledFetchData = useCallback(
    throttleWait ? throttle(debouncedFetchData, throttleWait) : debouncedFetchData,
    [debouncedFetchData, throttleWait]
  );

  // 初始加载 - 只在组件挂载时执行一次
  useEffect(() => {
    const { enabled = true } = optionsRef.current;
    if (enabled) {
      throttledFetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行

  // 定时刷新 - 当 refetchInterval 变化时重新设置定时器
  useEffect(() => {
    const { enabled = true } = optionsRef.current;
    if (refetchInterval && enabled) {
      const intervalId = setInterval(() => fetchData(true), refetchInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchData, refetchInterval]);

  // 清理函数 - 组件卸载时取消请求
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    cancel,
    isRefetching,
    retryCount: currentRetryCount
  };
}

// 清除特定缓存
export function clearCache(key: string) {
  cache.delete(key);
}

// 清除所有缓存
export function clearAllCache() {
  cache.clear();
}

// 清除过期缓存
export function clearExpiredCache() {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now - item.timestamp > (item as any).expires || (item as any).expires === undefined) {
      cache.delete(key);
    }
  }
}

