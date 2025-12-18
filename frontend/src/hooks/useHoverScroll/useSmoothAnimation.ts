import { useRef, useEffect, useCallback } from 'react';
import { calculateScrollStep, isScrollComplete } from './utils';

export interface UseSmoothAnimationOptions {
  easing?: number;
  threshold?: number;
  onFrame?: (currentScroll: number, targetScroll: number) => void;
}

export interface UseSmoothAnimationReturn {
  targetScrollRef: React.RefObject<number>;
  lastScrollLeftRef: React.RefObject<number>;
  setTarget: (position: number) => void;
  syncWithCurrent: () => void;
}

/**
 * 平滑滚动动画钩子
 */
export function useSmoothAnimation<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  enabledRef: React.RefObject<boolean>,
  hasScrollableContentRef: React.RefObject<boolean>,
  options: UseSmoothAnimationOptions = {}
): UseSmoothAnimationReturn {
  const { easing = 0.08, threshold = 0.5, onFrame } = options;

  const targetScrollRef = useRef(0);
  const animationFrameRef = useRef(0);
  const lastScrollLeftRef = useRef(0);
  
  const easingRef = useRef(easing);
  const thresholdRef = useRef(threshold);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    easingRef.current = easing;
    thresholdRef.current = threshold;
    onFrameRef.current = onFrame;
  }, [easing, threshold, onFrame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 初始化滚动位置
    targetScrollRef.current = container.scrollLeft;
    lastScrollLeftRef.current = container.scrollLeft;

    const animateScroll = () => {
      const currentContainer = containerRef.current;
      
      // 如果容器不存在或功能未启用，继续动画循环但不执行滚动
      if (!currentContainer || !enabledRef.current) {
        animationFrameRef.current = requestAnimationFrame(animateScroll);
        return;
      }

      // 检查是否有可滚动内容
      const hasScrollable = hasScrollableContentRef.current;
      if (!hasScrollable) {
        // 没有可滚动内容时，同步当前位置并继续循环
        targetScrollRef.current = currentContainer.scrollLeft;
        lastScrollLeftRef.current = currentContainer.scrollLeft;
        animationFrameRef.current = requestAnimationFrame(animateScroll);
        return;
      }

      const currentScroll = currentContainer.scrollLeft;
      const targetScroll = targetScrollRef.current!;

      if (!isScrollComplete(currentScroll, targetScroll, thresholdRef.current)) {
        const scrollStep = calculateScrollStep(currentScroll, targetScroll, easingRef.current);
        const newScrollLeft = currentScroll + scrollStep;
        currentContainer.scrollLeft = newScrollLeft;
        lastScrollLeftRef.current = newScrollLeft;
        onFrameRef.current?.(newScrollLeft, targetScroll);
      }

      animationFrameRef.current = requestAnimationFrame(animateScroll);
    };

    animationFrameRef.current = requestAnimationFrame(animateScroll);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [containerRef]);

  const setTarget = useCallback((position: number) => {
    targetScrollRef.current = Math.max(0, position);
  }, []);

  const syncWithCurrent = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      targetScrollRef.current = container.scrollLeft;
      lastScrollLeftRef.current = container.scrollLeft;
    }
  }, [containerRef]);

  return { targetScrollRef, lastScrollLeftRef, setTarget, syncWithCurrent };
}
