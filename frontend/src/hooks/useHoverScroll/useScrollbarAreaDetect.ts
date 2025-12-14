import { useRef, useEffect } from 'react';
import { isPointInScrollbarArea, calculateTargetFromMousePosition } from './utils';

export interface UseScrollbarAreaDetectOptions {
  scrollbarAreaHeight?: number;
  showDebugArea?: boolean;
  onPositionChange?: (targetScroll: number, mouseRatio: number) => void;
}

/**
 * 滚动轴区域检测钩子
 */
export function useScrollbarAreaDetect<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  enabledRef: React.RefObject<boolean>,
  hasScrollableContentRef: React.RefObject<boolean>,
  isInScrollbarAreaRef: React.RefObject<boolean>,
  options: UseScrollbarAreaDetectOptions = {}
): void {
  const { scrollbarAreaHeight = 16, showDebugArea = false, onPositionChange } = options;

  const scrollbarAreaHeightRef = useRef(scrollbarAreaHeight);
  const onPositionChangeRef = useRef(onPositionChange);

  useEffect(() => {
    scrollbarAreaHeightRef.current = scrollbarAreaHeight;
    onPositionChangeRef.current = onPositionChange;
  }, [scrollbarAreaHeight, onPositionChange]);

  // 调试可视化
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasScrollableContentRef.current) return;

    if (showDebugArea && process.env.NODE_ENV === 'development') {
      const existingIndicator = container.querySelector('.hover-scroll-indicator');
      if (existingIndicator) existingIndicator.remove();

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
      `;

      const originalPosition = container.style.position;
      if (!originalPosition || originalPosition === 'static') {
        container.style.position = 'relative';
      }

      container.appendChild(indicator);

      return () => {
        indicator.remove();
        if (container.style.position === 'relative' && !originalPosition) {
          container.style.position = '';
        }
      };
    }
  }, [containerRef, hasScrollableContentRef, showDebugArea, scrollbarAreaHeight]);

  // 鼠标事件监听
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!enabledRef.current) return;

      const containerRect = container.getBoundingClientRect();
      const inArea = isPointInScrollbarArea(e.clientX, e.clientY, containerRect, scrollbarAreaHeightRef.current);
      
      // 实时检查是否有可滚动内容
      const maxScroll = container.scrollWidth - container.clientWidth;
      const hasScrollable = maxScroll > 0;
      
      // 只有在有可滚动内容时才处理滚动区域检测
      if (!hasScrollable) {
        isInScrollbarAreaRef.current = false;
        return;
      }
      
      isInScrollbarAreaRef.current = inArea;

      if (inArea) {
        const targetScroll = calculateTargetFromMousePosition(
          e.clientX,
          containerRect.left,
          containerRect.width,
          maxScroll
        );
        const mouseRatio = (e.clientX - containerRect.left) / containerRect.width;
        onPositionChangeRef.current?.(targetScroll, mouseRatio);
      }
    };

    const handleMouseLeave = () => {
      isInScrollbarAreaRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (isInScrollbarAreaRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isInScrollbarAreaRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isInScrollbarAreaRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInScrollbarAreaRef.current) {
        const scrollKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'];
        if (scrollKeys.includes(e.code) || scrollKeys.includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef]);
}
