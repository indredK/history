import { useEffect, useRef, useCallback } from 'react';

interface UseFunctionPanelScrollOptions {
  /**
   * 滚动容器的引用
   */
  containerRef: React.RefObject<HTMLElement>;
  
  /**
   * 是否启用平滑滚动
   */
  smoothScroll?: boolean;
  
  /**
   * 滚动阈值，用于显示/隐藏渐变遮罩
   */
  scrollThreshold?: number;
  
  /**
   * 滚动回调函数
   */
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
}

interface ScrollState {
  isScrollable: boolean;
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollPercentage: number;
}

/**
 * 功能面板滚动Hook
 * 提供滚动状态管理、渐变遮罩控制和性能优化
 */
export function useFunctionPanelScroll({
  containerRef,
  smoothScroll = true,
  scrollThreshold = 10,
  onScroll
}: UseFunctionPanelScrollOptions) {
  const scrollStateRef = useRef<ScrollState>({
    isScrollable: false,
    isAtTop: true,
    isAtBottom: false,
    scrollPercentage: 0
  });

  const gradientTopRef = useRef<HTMLElement | null>(null);
  const gradientBottomRef = useRef<HTMLElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 更新渐变遮罩显示状态
  const updateGradientMasks = useCallback((scrollState: ScrollState) => {
    if (gradientTopRef.current) {
      gradientTopRef.current.style.opacity = 
        scrollState.isScrollable && !scrollState.isAtTop ? '1' : '0';
    }
    
    if (gradientBottomRef.current) {
      gradientBottomRef.current.style.opacity = 
        scrollState.isScrollable && !scrollState.isAtBottom ? '1' : '0';
    }
  }, []);

  // 计算滚动状态
  const calculateScrollState = useCallback((container: HTMLElement): ScrollState => {
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isScrollable = scrollHeight > clientHeight;
    const isAtTop = scrollTop <= scrollThreshold;
    const isAtBottom = scrollTop >= scrollHeight - clientHeight - scrollThreshold;
    const scrollPercentage = isScrollable 
      ? Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100))
      : 0;

    return {
      isScrollable,
      isAtTop,
      isAtBottom,
      scrollPercentage
    };
  }, [scrollThreshold]);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // 取消之前的动画帧
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // 使用 requestAnimationFrame 优化性能
    rafIdRef.current = requestAnimationFrame(() => {
      const newScrollState = calculateScrollState(container);
      
      // 只在状态发生变化时更新
      const prevState = scrollStateRef.current;
      if (
        newScrollState.isScrollable !== prevState.isScrollable ||
        newScrollState.isAtTop !== prevState.isAtTop ||
        newScrollState.isAtBottom !== prevState.isAtBottom ||
        Math.abs(newScrollState.scrollPercentage - prevState.scrollPercentage) > 1
      ) {
        scrollStateRef.current = newScrollState;
        updateGradientMasks(newScrollState);
        
        // 调用外部回调
        onScroll?.(container.scrollTop, container.scrollHeight, container.clientHeight);
      }
    });
  }, [containerRef, calculateScrollState, updateGradientMasks, onScroll]);

  // 平滑滚动到指定位置
  const scrollToPosition = useCallback((position: number, behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: position,
      behavior: smoothScroll ? behavior : 'auto'
    });
  }, [containerRef, smoothScroll]);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    scrollToPosition(0);
  }, [scrollToPosition]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    scrollToPosition(container.scrollHeight - container.clientHeight);
  }, [containerRef, scrollToPosition]);

  // 设置渐变遮罩元素引用
  const setGradientRefs = useCallback((topElement: HTMLElement | null, bottomElement: HTMLElement | null) => {
    gradientTopRef.current = topElement;
    gradientBottomRef.current = bottomElement;
    
    // 初始化渐变遮罩状态
    if (containerRef.current) {
      const initialState = calculateScrollState(containerRef.current);
      scrollStateRef.current = initialState;
      updateGradientMasks(initialState);
    }
  }, [containerRef, calculateScrollState, updateGradientMasks]);

  // 获取当前滚动状态
  const getScrollState = useCallback((): ScrollState => {
    return { ...scrollStateRef.current };
  }, []);

  // 设置滚动事件监听器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 初始化滚动状态
    const initialState = calculateScrollState(container);
    scrollStateRef.current = initialState;
    updateGradientMasks(initialState);

    // 添加滚动事件监听器
    container.addEventListener('scroll', handleScroll, { passive: true });

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });
    resizeObserver.observe(container);

    // 清理函数
    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [containerRef, calculateScrollState, updateGradientMasks, handleScroll]);

  return {
    scrollToPosition,
    scrollToTop,
    scrollToBottom,
    setGradientRefs,
    getScrollState,
    scrollState: scrollStateRef.current
  };
}

export type { ScrollState, UseFunctionPanelScrollOptions };