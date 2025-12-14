import { useEffect, useCallback, useRef } from 'react';
import type { ScrollState } from './utils';

export interface UseScrollStateReturn {
  hasScrollableContentRef: React.RefObject<boolean>;
  getScrollState: () => ScrollState;
}

/**
 * 滚动状态管理钩子
 */
export function useScrollState<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>
): UseScrollStateReturn {
  const hasScrollableContentRef = useRef<boolean>(false);

  // 使用 ResizeObserver 监听容器和内容尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScrollableState = () => {
      hasScrollableContentRef.current = container.scrollWidth > container.clientWidth;
    };

    // 初始检查
    updateScrollableState();

    // 使用 ResizeObserver 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      updateScrollableState();
    });
    resizeObserver.observe(container);

    // 使用 MutationObserver 监听子元素变化（内容加载）
    const mutationObserver = new MutationObserver(() => {
      // 延迟检查，确保 DOM 更新完成
      requestAnimationFrame(updateScrollableState);
    });
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [containerRef]);

  const getScrollState = useCallback((): ScrollState => {
    const container = containerRef.current;
    if (!container) {
      return { scrollLeft: 0, maxScroll: 0, hasScrollableContent: false };
    }

    return {
      scrollLeft: container.scrollLeft,
      maxScroll: Math.max(0, container.scrollWidth - container.clientWidth),
      hasScrollableContent: hasScrollableContentRef.current
    };
  }, [containerRef]);

  return {
    hasScrollableContentRef,
    getScrollState
  };
}
