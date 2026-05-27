import { useEffect } from 'react';
import { useRequest } from 'ahooks';

interface UseCollectionResourceOptions<T> {
  cacheKey: string;
  items: T[];
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
  const { run, loading: requestLoading } = useRequest(load, {
    manual: true,
    cacheKey,
    onBefore: () => setLoading(true),
    onSuccess: (data) => {
      setItems(data);
      setError(null);
    },
    onError: (err) => {
      console.error(errorMessage, err);
      setError(err as Error);
    },
    onFinally: () => setLoading(false),
  });

  useEffect(() => {
    if (items.length === 0 && !loading && !requestLoading) {
      run();
    }
  }, [items.length, loading, requestLoading, run]);

  return {
    reload: run,
    requestLoading,
  };
}
