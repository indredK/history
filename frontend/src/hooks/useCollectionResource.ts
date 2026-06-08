import { useCallback, useEffect, useRef } from 'react';

interface UseCollectionResourceOptions<T> {
  cacheKey: string;
  items: T[] | null | undefined;
  loading: boolean;
  load: () => Promise<T[]>;
  setItems: (items: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  errorMessage: string;
}

export function useCollectionResource<T>({
  cacheKey,
  items,
  loading,
  load,
  setItems,
  setLoading,
  setError,
  errorMessage,
}: UseCollectionResourceOptions<T>) {
  const autoLoadKeyRef = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const itemCount = Array.isArray(items) ? items.length : 0;

  const run = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);

    try {
      const data = await load();
      const nextItems = Array.isArray(data) ? data : [];
      if (mountedRef.current && requestIdRef.current === requestId) {
        setItems(nextItems);
        setError(null);
      }
      return nextItems;
    } catch (err) {
      if (mountedRef.current && requestIdRef.current === requestId) {
        console.error(errorMessage, err);
        setError(err as Error);
      }
      throw err;
    } finally {
      if (mountedRef.current && requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [errorMessage, load, setError, setItems, setLoading]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      autoLoadKeyRef.current = null;
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (
      autoLoadKeyRef.current !== cacheKey &&
      itemCount === 0 &&
      !loading
    ) {
      autoLoadKeyRef.current = cacheKey;
      void run();
    }
  }, [cacheKey, itemCount, loading, run]);

  return {
    reload: run,
    requestLoading: loading,
  };
}
