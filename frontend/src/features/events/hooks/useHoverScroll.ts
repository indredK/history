import { useRef, useCallback, useEffect } from 'react';
import { useSize } from 'ahooks';

interface UseHoverScrollOptions {
  easing?: number;
  enabled?: boolean;
  onScrollChange?: (scrollLeft: number, targetScroll: number) => void;
  scrollbarAreaHeight?: number; // 滚动轴区域高度（像素）
  showScrollbarArea?: boolean; // 是否显示滚动轴区域（调试用）
}

export const useHoverScroll = <T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  options: UseHoverScrollOptions = {}
) => {
  const {
    easing = 0.08,
    enabled = true,
    onScrollChange,
    scrollbarAreaHeight = 16, // 默认滚动轴区域高度
    showScrollbarArea = false // 默认不显示滚动轴区域
  } = options;

  const targetScrollRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const isEnabledRef = useRef<boolean>(enabled);
  const hasScrollableContentRef = useRef<boolean>(false);

  // 更新启用状态
  useEffect(() => {
    isEnabledRef.current = enabled;
  }, [enabled]);

  // 平滑滚动动画
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // 初始化目标位置
    targetScrollRef.current = container.scrollLeft;
    
    const animateScroll = () => {
      const currentContainer = containerRef.current;
      if (!currentContainer || !isEnabledRef.current || !hasScrollableContentRef.current) {
        animationFrameRef.current = requestAnimationFrame(animateScroll);
        return;
      }
      
      const currentScroll = currentContainer.scrollLeft;
      const targetScroll = targetScrollRef.current;
      
      // 如果目标位置和当前位置不同，进行滚动
      if (Math.abs(currentScroll - targetScroll) > 0.5) {
        // 使用缓动函数实现平滑滚动
        const scrollStep = (targetScroll - currentScroll) * easing;
        currentContainer.scrollLeft = currentScroll + scrollStep;
        
        // 触发回调
        onScrollChange?.(currentScroll + scrollStep, targetScroll);
      }
      
      // 继续下一帧动画
      animationFrameRef.current = requestAnimationFrame(animateScroll);
    };
    
    // 启动动画循环
    animationFrameRef.current = requestAnimationFrame(animateScroll);
    
    // 清理动画帧
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [containerRef, easing, onScrollChange]);
  
  // 使用ahooks的useSize监听容器尺寸变化
  const containerSize = useSize(containerRef);
  
  // 更新可滚动内容状态
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const hasScrollableContent = container.scrollWidth > container.clientWidth;
      hasScrollableContentRef.current = hasScrollableContent;
      
      // 显示滚动轴区域（调试用）
      if (showScrollbarArea && hasScrollableContent && process.env.NODE_ENV === 'development') {
        // 移除之前的可能存在的可视化元素
        const existingIndicator = container.querySelector('.hover-scroll-indicator');
        if (existingIndicator) {
          existingIndicator.remove();
        }
        
        // 创建滚动轴区域可视化元素
        const indicator = document.createElement('div');
        indicator.className = 'hover-scroll-indicator';
        indicator.style.cssText = `
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: ${scrollbarAreaHeight}px;
          background-color: rgba(59, 130, 246, 0.2);
          border-top: 1px dashed rgba(59, 130, 246, 0.5);
          pointer-events: none;
          z-index: 9999;
          transition: opacity 0.2s ease;
        `;
        
        // 确保容器有相对定位
        const originalPosition = container.style.position;
        if (!originalPosition || originalPosition === 'static') {
          container.style.position = 'relative';
        }
        
        container.appendChild(indicator);
        
        // 清理函数
        return () => {
          if (indicator.parentNode) {
            indicator.remove();
          }
          // 恢复原始定位
          if (container.style.position === 'relative' && !originalPosition) {
            container.style.position = '';
          }
        };
      }
      
      if (process.env.NODE_ENV === 'development' && !showScrollbarArea) {
        console.log('useHoverScroll: 可滚动状态更新', {
          scrollWidth: container.scrollWidth,
          clientWidth: container.clientWidth,
          hasScrollableContent
        });
      }
    }
  }, [containerSize, containerRef, showScrollbarArea, scrollbarAreaHeight]);

  // 只在滚动轴区域监听鼠标事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasScrollableContentRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('useHoverScroll: 容器不存在或无滚动内容', { 
          hasContainer: !!container, 
          hasScrollableContent: hasScrollableContentRef.current 
        });
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isEnabledRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('useHoverScroll: 未启用');
        }
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // 只在横向滚动轴区域生效
      // 计算滚动轴区域：容器的底部区域
      const scrollbarTop = containerRect.bottom - scrollbarAreaHeight;
      
      // 检查鼠标是否在滚动轴区域内
      const isInScrollbarArea = mouseX >= containerRect.left &&
                                 mouseX <= containerRect.right &&
                                 mouseY >= scrollbarTop &&
                                 mouseY <= containerRect.bottom;

      if (process.env.NODE_ENV === 'development') {
        console.log('useHoverScroll: 鼠标移动检测', {
          mouseX,
          mouseY,
          containerRect,
          scrollbarTop,
          scrollbarAreaHeight,
          isInScrollbarArea
        });
      }

      if (isInScrollbarArea) {
        // 计算鼠标在滚动轴内的相对位置 (0-1)
        const mouseRatio = Math.max(0, Math.min(1, (mouseX - containerRect.left) / containerRect.width));
        // 计算最大可滚动距离
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('useHoverScroll: 在滚动区域内', { mouseRatio, maxScroll, targetScroll: mouseRatio * maxScroll });
        }
        
        if (maxScroll > 0) {
          targetScrollRef.current = mouseRatio * maxScroll;
          onScrollChange?.(container.scrollLeft, targetScrollRef.current);
        }
      }
    };

    const handleMouseLeave = () => {
      // 鼠标离开时保持当前位置，不强制滚动
      if (process.env.NODE_ENV === 'development') {
        console.log('useHoverScroll: 鼠标离开滚动轴区域');
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, onScrollChange]);
  // 手动设置滚动位置的函数
  const setScrollPosition = useCallback((position: number) => {
    targetScrollRef.current = Math.max(0, position);
  }, []);

  // 启用/禁用悬停滚动的函数
  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  // 获取当前滚动状态
  const getScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { scrollLeft: 0, maxScroll: 0, hasScrollableContent: false };
    
    return {
      scrollLeft: container.scrollLeft,
      maxScroll: Math.max(0, container.scrollWidth - container.clientWidth),
      hasScrollableContent: hasScrollableContentRef.current
    };
  }, [containerRef]);

  return {
    setScrollPosition,
    setEnabled,
    getScrollState
  };
};