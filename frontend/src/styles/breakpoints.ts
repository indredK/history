// 响应式断点配置
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export const mediaQueries = {
  up: (breakpoint: keyof typeof breakpoints) => 
    `@media (min-width: ${breakpoints[breakpoint]}px)`,
  down: (breakpoint: keyof typeof breakpoints) => 
    `@media (max-width: ${breakpoints[breakpoint] - 1}px)`,
  between: (start: keyof typeof breakpoints, end: keyof typeof breakpoints) =>
    `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 1}px)`,
  only: (breakpoint: keyof typeof breakpoints) => {
    const keys = Object.keys(breakpoints) as (keyof typeof breakpoints)[];
    const index = keys.indexOf(breakpoint);
    const nextBreakpoint = keys[index + 1];
    
    if (!nextBreakpoint) {
      return `@media (min-width: ${breakpoints[breakpoint]}px)`;
    }
    
    return `@media (min-width: ${breakpoints[breakpoint]}px) and (max-width: ${breakpoints[nextBreakpoint] - 1}px)`;
  }
};

import React from 'react';

// 响应式 hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof breakpoints>('md');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const keys = Object.keys(breakpoints) as (keyof typeof breakpoints)[];
      
      for (let i = keys.length - 1; i >= 0; i--) {
        if (width >= breakpoints[keys[i]]) {
          setBreakpoint(keys[i]);
          break;
        }
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}