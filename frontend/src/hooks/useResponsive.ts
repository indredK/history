/**
 * 响应式布局 Hook
 * 用于检测当前设备类型和屏幕尺寸
 */

import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
}

export interface Breakpoints {
  mobileXs: number;
  mobileSm: number;
  mobileMd: number;
  tabletSm: number;
  tabletMd: number;
  desktop: number;
}

const defaultBreakpoints: Breakpoints = {
  mobileXs: 320,
  mobileSm: 375,
  mobileMd: 414,
  tabletSm: 768,
  tabletMd: 1024,
  desktop: 1200,
};

/**
 * 使用响应式布局
 * @param breakpoints 自定义断点配置
 * @returns 响应式状态对象
 */
export function useResponsive(breakpoints: Breakpoints = defaultBreakpoints): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < breakpoints.tabletSm,
      isTablet: width >= breakpoints.tabletSm && width < breakpoints.desktop,
      isDesktop: width >= breakpoints.desktop,
      isSmallMobile: width < breakpoints.mobileSm,
      isLandscape: width > height,
      screenWidth: width,
      screenHeight: height,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        isMobile: width < breakpoints.tabletSm,
        isTablet: width >= breakpoints.tabletSm && width < breakpoints.desktop,
        isDesktop: width >= breakpoints.desktop,
        isSmallMobile: width < breakpoints.mobileSm,
        isLandscape: width > height,
        screenWidth: width,
        screenHeight: height,
      });
    };

    // 使用防抖优化性能
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoints]);

  return state;
}

/**
 * 使用媒体查询
 * @param query 媒体查询字符串
 * @returns 是否匹配
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 现代浏览器使用 addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 旧版浏览器使用 addListener
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * 使用触摸设备检测
 * @returns 是否为触摸设备
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  });

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
  }, []);

  return isTouch;
}

/**
 * 使用设备方向
 * @returns 设备方向信息
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<{
    angle: number;
    type: 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary' | 'unknown';
  }>(() => {
    if (typeof window !== 'undefined' && window.screen.orientation) {
      return {
        angle: window.screen.orientation.angle,
        type: window.screen.orientation.type as any,
      };
    }
    return {
      angle: 0,
      type: 'unknown',
    };
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.screen.orientation) {
        setOrientation({
          angle: window.screen.orientation.angle,
          type: window.screen.orientation.type as any,
        });
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    
    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  return orientation;
}

/**
 * 使用视口尺寸
 * @returns 视口宽度和高度
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return viewport;
}
