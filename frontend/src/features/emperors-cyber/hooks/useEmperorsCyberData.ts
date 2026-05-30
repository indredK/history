import { useEffect, useState } from 'react';

import { loadEmperorsCyberData } from '../data';
import type { CyberEmperor, DynastyItem } from '../types';

export function useEmperorsCyberData() {
  const [dynasties, setDynasties] = useState<DynastyItem[]>([]);
  const [emperors, setEmperors] = useState<CyberEmperor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const result = await loadEmperorsCyberData();

        if (!cancelled) {
          setDynasties(result.dynasties);
          setEmperors(result.emperors);
        }
      } catch (error) {
        console.error('Failed to load emperor cyber data:', error);
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
  }, []);

  return {
    dynasties,
    emperors,
    loading,
  };
}
