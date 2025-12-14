import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useHoverScroll } from '../../hooks/useHoverScroll';
import type { UseHoverScrollOptions, UseHoverScrollReturn } from '../../hooks/useHoverScroll';
import './HoverScrollContainer.css';

export interface HoverScrollContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactNode;
  hoverScrollOptions?: UseHoverScrollOptions;
  containerClassName?: string;
}

export interface HoverScrollContainerRef extends UseHoverScrollReturn {
  containerElement: HTMLDivElement | null;
}

/**
 * 悬停滚动容器组件
 * 提供鼠标悬停在底部区域时的平滑滚动功能
 */
export const HoverScrollContainer = forwardRef<HoverScrollContainerRef, HoverScrollContainerProps>(
  ({ children, hoverScrollOptions, containerClassName, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    const scrollControl = useHoverScroll(containerRef, hoverScrollOptions);

    useImperativeHandle(ref, () => ({
      ...scrollControl,
      containerElement: containerRef.current
    }), [scrollControl]);

    return (
      <div
        ref={containerRef}
        className={`hover-scroll-container ${containerClassName || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HoverScrollContainer.displayName = 'HoverScrollContainer';
