/**
 * 响应式布局组件
 * 提供不同设备下的布局方案
 * 
 * 应用苹果毛玻璃风格（Glassmorphism）
 * Requirements: 6.1, 6.2
 */

import React from 'react';
import { Box, Stack, StackProps } from '@mui/material';
import { useResponsive } from '@/hooks/useResponsive';
import { getGlassConfig } from '@/config/glassConfig';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'responsive';
  spacing?: number | string;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  maxWidth?: string | number;
  centerContent?: boolean;
  glassEffect?: boolean;
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  spacing?: number | string;
  glassEffect?: boolean;
}

interface ResponsiveStackProps extends StackProps {
  children: React.ReactNode;
  mobileDirection?: 'row' | 'column';
  tabletDirection?: 'row' | 'column';
  desktopDirection?: 'row' | 'column';
  glassEffect?: boolean;
}

export function ResponsiveLayout({
  children,
  direction = 'responsive',
  spacing = 2,
  alignItems = 'flex-start',
  justifyContent = 'flex-start',
  wrap = true,
  maxWidth,
  centerContent = false,
  glassEffect = false,
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet, screenWidth } = useResponsive();
  
  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);
  const navConfig = glassConfig.components.navigation;

  const getDirection = () => {
    if (direction === 'responsive') {
      return isMobile ? 'column' : 'row';
    }
    return direction;
  };

  const getSpacing = () => {
    if (typeof spacing === 'number') {
      if (isMobile) return spacing * 0.5;
      if (isTablet) return spacing * 0.75;
      return spacing;
    }
    return spacing;
  };

  // 毛玻璃样式
  const glassStyles = glassEffect ? {
    backdropFilter: `blur(${navConfig.blur})`,
    WebkitBackdropFilter: `blur(${navConfig.blur})`,
    backgroundColor: `rgba(30, 30, 30, ${navConfig.bgOpacity})`,
    border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
    borderRadius: glassConfig.border.radius.lg,
    boxShadow: glassConfig.shadow.md,
    padding: isMobile ? '12px' : '16px',
  } : {};

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: getDirection(),
        alignItems,
        justifyContent,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: getSpacing(),
        width: '100%',
        ...(maxWidth && {
          maxWidth,
          margin: centerContent ? '0 auto' : undefined,
        }),
        ...glassStyles,
      }}
    >
      {children}
    </Box>
  );
}

export function ResponsiveGrid({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  spacing = 2,
  glassEffect = false,
  ...props
}: ResponsiveGridProps) {
  const { isMobile, isTablet, screenWidth } = useResponsive();
  
  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);

  const getColumns = () => {
    if (isMobile) return mobileColumns;
    if (isTablet) return tabletColumns;
    return desktopColumns;
  };

  const getSpacing = () => {
    if (typeof spacing === 'number') {
      if (isMobile) return spacing * 0.5;
      if (isTablet) return spacing * 0.75;
      return spacing;
    }
    return spacing;
  };

  const columns = getColumns();
  const gridSpacing = getSpacing();

  // 毛玻璃样式
  const glassStyles = glassEffect ? {
    backdropFilter: `blur(${glassConfig.blur.light})`,
    WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
    backgroundColor: `rgba(30, 30, 30, ${glassConfig.bgOpacity.light})`,
    border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
    borderRadius: glassConfig.border.radius.lg,
    boxShadow: glassConfig.shadow.sm,
    padding: isMobile ? '8px' : '12px',
  } : {};

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gridSpacing,
        width: '100%',
        ...glassStyles,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export function ResponsiveStack({
  children,
  mobileDirection = 'column',
  tabletDirection = 'row',
  desktopDirection = 'row',
  spacing = 2,
  glassEffect = false,
  ...props
}: ResponsiveStackProps) {
  const { isMobile, isTablet, screenWidth } = useResponsive();
  
  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);

  const getDirection = () => {
    if (isMobile) return mobileDirection;
    if (isTablet) return tabletDirection;
    return desktopDirection;
  };

  const getSpacing = () => {
    if (typeof spacing === 'number') {
      if (isMobile) return spacing * 0.5;
      if (isTablet) return spacing * 0.75;
      return spacing;
    }
    return spacing;
  };

  // 毛玻璃样式
  const glassStyles = glassEffect ? {
    backdropFilter: `blur(${glassConfig.blur.light})`,
    WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
    backgroundColor: `rgba(30, 30, 30, ${glassConfig.bgOpacity.light})`,
    border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
    borderRadius: glassConfig.border.radius.md,
    boxShadow: glassConfig.shadow.sm,
    padding: isMobile ? '8px' : '12px',
  } : {};

  return (
    <Stack
      direction={getDirection()}
      spacing={getSpacing()}
      sx={{
        ...glassStyles,
        ...(props.sx || {}),
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}