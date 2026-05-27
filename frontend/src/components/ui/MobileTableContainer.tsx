/**
 * 移动端优化的表格容器组件
 * 提供更好的移动端表格体验
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  KeyboardArrowUp as ScrollTopIcon,
  SwapHoriz as SwipeIcon,
} from '@mui/icons-material';
import { useResponsive } from '@/hooks/useResponsive';

interface MobileTableContainerProps {
  children: React.ReactNode;
  height?: string | number;
  showScrollIndicator?: boolean;
  showSwipeHint?: boolean;
  className?: string;
}

export function MobileTableContainer({
  children,
  height = '100%', // 改为使用100%高度，让父容器控制
  showScrollIndicator = true,
  showSwipeHint = true,
  className,
}: MobileTableContainerProps) {
  const { isMobile, isSmallMobile } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // 使用传入的高度或默认100%
  const adjustedHeight = height;

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollLeft = container.scrollLeft;
      
      // 显示/隐藏回到顶部按钮
      setShowScrollTop(scrollTop > 200);
      
      // 记录用户已经滚动过
      if (scrollTop > 0 || scrollLeft > 0) {
        setHasScrolled(true);
        setShowHint(false);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 显示滑动提示
  useEffect(() => {
    if (isMobile && showSwipeHint && !hasScrolled) {
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 1000);

      const hideTimer = setTimeout(() => {
        setShowHint(false);
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
    return undefined;
  }, [isMobile, showSwipeHint, hasScrolled]);

  // 回到顶部
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: adjustedHeight,
        width: '100%',
      }}
      className={className}
    >
      {/* 主表格容器 */}
      <Paper
        ref={containerRef}
        component="div"
        sx={{
          height: '100%',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          touchAction: 'pan-x pan-y', // 允许滚动
          
          // 移动端优化
          ...(isMobile && {
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }),
          
          // 滚动阴影效果
          background: `
            linear-gradient(90deg, rgba(var(--glass-surface-rgb), 0.96) 30%, rgba(var(--glass-surface-rgb), 0)),
            linear-gradient(90deg, rgba(var(--glass-surface-rgb), 0), rgba(var(--glass-surface-rgb), 0.96) 70%),
            linear-gradient(90deg, rgba(0,0,0,.2), rgba(0,0,0,0)),
            linear-gradient(270deg, rgba(0,0,0,.2), rgba(0,0,0,0))
          `,
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgba(var(--glass-surface-rgb), 0.96)',
          backgroundSize: '40px 100%, 40px 100%, 14px 100%, 14px 100%',
          backgroundPosition: '0 0, 100% 0, 0 0, 100% 0',
          backgroundAttachment: 'local, local, scroll, scroll',
        }}
      >
        {children}
      </Paper>

      {/* 滑动提示 */}
      {isMobile && (
        <Fade in={showHint} timeout={500}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: 16,
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              background: 'rgba(var(--glass-surface-soft-rgb), 0.88)',
              color: 'var(--color-text-primary)',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              pointerEvents: 'none',
              zIndex: 10,
              animation: 'pulse 2s infinite',
            }}
          >
            <SwipeIcon sx={{ fontSize: 16 }} />
            左右滑动查看更多
          </Box>
        </Fade>
      )}

      {/* 回到顶部按钮 */}
      {isMobile && showScrollIndicator && (
        <Fade in={showScrollTop} timeout={300}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 16, // 回到正常位置，因为现在有专门的导航栏区域
              right: 16,
              zIndex: 1000,
            }}
          >
            <Tooltip title="回到顶部" placement="left">
              <IconButton
                onClick={scrollToTop}
                sx={{
                  width: 48,
                  height: 48,
                  background: 'var(--color-primary-gradient)',
                  color: 'var(--color-text-inverse)',
                  boxShadow: '0 4px 20px rgba(199, 143, 69, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b6762b 0%, #f3d29b 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(199, 143, 69, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ScrollTopIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>
      )}

      {/* 移动端表格说明 */}
      {isSmallMobile && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0, // 回到正常位置
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(var(--glass-surface-soft-rgb), 0.92), transparent)',
            color: 'var(--color-text-primary)',
            padding: '8px 12px',
            fontSize: '0.7rem',
            textAlign: 'center',
            pointerEvents: 'none',
            opacity: showHint ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          提示：表格可以左右滑动查看完整内容
        </Box>
      )}
    </Box>
  );
}
