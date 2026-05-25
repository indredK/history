/**
 * 滚轮切换朝代 hook —— 带 200ms 节流
 */

import { useEffect, useRef, type RefObject } from 'react';

interface Options {
  containerRef: RefObject<HTMLDivElement | null>;
  total: number;
  setActiveIndex: (updater: (prev: number) => number) => void;
}

export function useDynastyWheelScroll({ containerRef, total, setActiveIndex }: Options) {
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      setActiveIndex((prev) => (prev + direction + total) % total);

      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 200);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [containerRef, total, setActiveIndex]);
}
