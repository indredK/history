/**
 * 响应式布局组件
 * 提供不同设备下的布局方案
 */

import React from 'react';
import { Box, Stack, StackProps } from '@mui/material';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'responsive';
  spacing?: number | string;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  maxWidth?: string | number;
  centerContent?: boolean;
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  spacing?: number | string;
}

interface ResponsiveStackProps extends StackProps {
  children: React.ReactNode;
  mobileDirection?: 'row' | 'column';
  tabletDirection?: 'row' | 'column';
  desktopDirection?: 'row' | 'column';
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
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet } = useResponsive();

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
  ...props
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useResponsive();

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

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gridSpacing,
        width: '100%',
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
  ...props
}: ResponsiveStackProps) {
  const { isMobile, isTablet } = useResponsive();

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

  return (
    <Stack
      direction={getDirection()}
      spacing={getSpacing()}
      {...props}
    >
      {children}
    </Stack>
  );
}