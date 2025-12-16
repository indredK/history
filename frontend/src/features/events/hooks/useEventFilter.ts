import { useMemo } from 'react';
import { useEventsStore } from '@/store';

export function useEventFilter() {
  const { events, searchQuery } = useEventsStore();
  const filtered = useMemo(() => {
    if (!searchQuery) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description ?? '').toLowerCase().includes(q)
    );
  }, [events, searchQuery]);
  return filtered;
}

