/**
 * 滚轮切换朝代 hook —— 带节流的容器内切换
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
  const WHEEL_THRESHOLD = 6;
  const SCROLL_LOCK_MS = 220;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || total <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;

      const primaryDelta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (Math.abs(primaryDelta) < WHEEL_THRESHOLD) return;
      e.preventDefault();
      if (isScrollingRef.current) return;

      const direction = primaryDelta > 0 ? 1 : -1;
      setActiveIndex((prev) => (prev + direction + total) % total);

      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, SCROLL_LOCK_MS);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [containerRef, total, setActiveIndex]);
}
