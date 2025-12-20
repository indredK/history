/**
 * 响应式容器组件
 * 根据屏幕尺寸自动调整内边距和布局
 */

import { Box, BoxProps } from '@mui/material';
import { useResponsive } from '@/hooks/useResponsive';
import { getResponsiveSpacing } from '@/config/responsive';

interface ResponsiveContainerProps extends BoxProps {
  children: React.ReactNode;
  disablePadding?: boolean;
  maxWidth?: string | number;
  centerContent?: boolean;
}

export function ResponsiveContainer({
  children,
  disablePadding = false,
  maxWidth,
  centerContent = false,
  sx,
  ...props
}: ResponsiveContainerProps) {
  const { screenWidth, isMobile, isSmallMobile } = useResponsive();
  const spacing = getResponsiveSpacing(screenWidth);

  return (
    <Box
      sx={{
        width: '100%',
        padding: disablePadding ? 0 : spacing,
        ...(maxWidth && {
          maxWidth,
          margin: centerContent ? '0 auto' : undefined,
        }),
        ...(isMobile && {
          padding: disablePadding ? 0 : isSmallMobile ? '4px' : '8px',
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}