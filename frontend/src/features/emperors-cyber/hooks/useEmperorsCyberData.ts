import { useEffect, useState } from 'react';

import { loadEmperorsCyberData } from '../data';
import type { CyberEmperor, DynastyItem } from '../types';

export function useEmperorsCyberData() {
  const [dynasties, setDynasties] = useState<DynastyItem[]>([]);
  const [emperors, setEmperors] = useState<CyberEmperor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await loadEmperorsCyberData();

        if (!cancelled) {
          setDynasties(result.dynasties);
          setEmperors(result.emperors);
        }
      } catch (error) {
        console.error('Failed to load emperor cyber data:', error);
        if (!cancelled) {
          setError(error instanceof Error ? error : new Error('帝王档案数据加载失败'));
          setDynasties([]);
          setEmperors([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    dynasties,
    emperors,
    loading,
    error,
    reload: () => setReloadKey((key) => key + 1),
  };
}
