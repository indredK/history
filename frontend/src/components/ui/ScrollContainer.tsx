/**
 * 滚动容器组件
 * Scroll Container Component
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';
import './ScrollContainer.css';

interface ScrollContainerProps extends Omit<BoxProps, 'onScroll'> {
  /** 子元素 */
  children: React.ReactNode;
  /** 滚动到底部时的回调 */
  onScrollEnd?: () => void;
  /** 用于保存滚动位置的唯一键 */
  preserveScrollKey?: string;
  /** 是否显示滚动到底部的指示器 */
  showEndIndicator?: boolean;
  /** 自定义类名 */
  className?: string;
}

// 滚动位置缓存
const scrollPositionCache = new Map<string, number>();

/**
 * 滚动容器组件
 * 提供平滑滚动、自定义滚动条、自动隐藏等功能
 */
export function ScrollContainer({
  children,
  onScrollEnd,
  preserveScrollKey,
  showEndIndicator = false,
  className = '',
  ...boxProps
}: ScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 恢复滚动位置
  useEffect(() => {
    if (preserveScrollKey && containerRef.current) {
      const savedPosition = scrollPositionCache.get(preserveScrollKey);
      if (savedPosition !== undefined) {
        containerRef.current.scrollTop = savedPosition;
      }
    }
  }, [preserveScrollKey]);

  // 保存滚动位置
  const saveScrollPosition = useCallback(() => {
    if (preserveScrollKey && containerRef.current) {
      scrollPositionCache.set(preserveScrollKey, containerRef.current.scrollTop);
    }
  }, [preserveScrollKey]);

  // 检查是否滚动到底部
  const checkScrollEnd = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 50; // 距离底部 50px 时认为到达底部
    const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;

    setIsAtBottom(atBottom);

    if (atBottom && onScrollEnd) {
      onScrollEnd();
    }
  }, [onScrollEnd]);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    // 清除之前的隐藏定时器
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // 清除之前的滚动结束定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 检查是否到达底部
    checkScrollEnd();

    // 保存滚动位置
    saveScrollPosition();

    // 滚动停止后 1.5 秒隐藏滚动条
    hideTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1500);

    // 滚动结束检测
    scrollTimeoutRef.current = setTimeout(() => {
      checkScrollEnd();
    }, 100);
  }, [checkScrollEnd, saveScrollPosition]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      className={`scroll-container ${isScrolling ? 'scrolling' : ''} ${className}`}
      onScroll={handleScroll}
      {...boxProps}
      sx={{
        overflow: 'auto',
        height: '100%',
        position: 'relative',
        ...boxProps.sx,
      }}
    >
      {children}
      
      {/* 底部指示器 */}
      {showEndIndicator && isAtBottom && (
        <Box
          className="scroll-end-indicator"
          sx={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to top, var(--color-primary), transparent)',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  );
}

export default ScrollContainer;
