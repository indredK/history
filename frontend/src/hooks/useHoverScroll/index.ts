import { useRef, useCallback, useEffect } from 'react';
import { useSmoothAnimation } from './useSmoothAnimation';
import { useScrollbarAreaDetect } from './useScrollbarAreaDetect';
import { useScrollState } from './useScrollState';
import type { ScrollState } from './utils';

export interface UseHoverScrollOptions {
  easing?: number;
  enabled?: boolean;
  onScrollChange?: (scrollLeft: number, targetScroll: number) => void;
  scrollbarAreaHeight?: number;
  showScrollbarArea?: boolean;
}

export interface UseHoverScrollReturn {
  setScrollPosition: (position: number) => void;
  setEnabled: (enabled: boolean) => void;
  getScrollState: () => ScrollState;
}

/**
 * 悬停滚动钩子
 * 在容器底部区域实现鼠标悬停时的平滑滚动功能
 */
export const useHoverScroll = <T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  options: UseHoverScrollOptions = {}
): UseHoverScrollReturn => {
  const {
    easing = 0.08,
    enabled = true,
    onScrollChange,
    scrollbarAreaHeight = 16,
    showScrollbarArea = false
  } = options;

  const isEnabledRef = useRef<boolean>(enabled);

  useEffect(() => {
    isEnabledRef.current = enabled;
  }, [enabled]);

  const { hasScrollableContentRef, getScrollState } = useScrollState(containerRef);

  const isInScrollbarAreaRef = useRef<boolean>(false);

  // 只在悬停区域时触发回调
  const onFrameCallback = useCallback((currentScroll: number, targetScroll: number) => {
    if (isInScrollbarAreaRef.current) {
      onScrollChange?.(currentScroll, targetScroll);
    }
  }, [onScrollChange]);

  const { targetScrollRef, lastScrollLeftRef, setTarget } = useSmoothAnimation(
    containerRef,
    isEnabledRef,
    hasScrollableContentRef,
    { easing, onFrame: onFrameCallback }
  );

  useScrollbarAreaDetect(
    containerRef,
    isEnabledRef,
    hasScrollableContentRef,
    isInScrollbarAreaRef,
    {
      scrollbarAreaHeight,
      showDebugArea: showScrollbarArea,
      onPositionChange: (targetScroll) => {
        setTarget(targetScroll);
        const container = containerRef.current;
        if (container) {
          lastScrollLeftRef.current = container.scrollLeft;
        }
      }
    }
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // 不在滚动轴区域时，检测用户手动滚动
      if (!isInScrollbarAreaRef.current) {
        const currentScroll = container.scrollLeft;
        const lastScroll = lastScrollLeftRef.current ?? 0;
        const scrollDiff = Math.abs(currentScroll - lastScroll);

        // 如果滚动差异较大，说明是用户手动滚动，同步目标位置
        if (scrollDiff > 1) {
          targetScrollRef.current = currentScroll;
          lastScrollLeftRef.current = currentScroll;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, isInScrollbarAreaRef, targetScrollRef, lastScrollLeftRef]);

  const setScrollPosition = useCallback((position: number) => {
    setTarget(position);
  }, [setTarget]);

  const setEnabled = useCallback((newEnabled: boolean) => {
    isEnabledRef.current = newEnabled;
  }, []);

  return { setScrollPosition, setEnabled, getScrollState };
};

// 导出类型和工具函数
export type { ScrollState, AreaBounds, SerializedScrollState } from './utils';
export { 
  calculateScrollStep, 
  isScrollComplete, 
  calculateTargetFromMousePosition,
  isPointInScrollbarArea,
  getScrollbarAreaBounds,
  serializeScrollState,
  deserializeScrollState
} from './utils';
