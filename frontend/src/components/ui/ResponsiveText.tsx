/**
 * 响应式文本组件
 * 根据屏幕尺寸自动调整字体大小
 */

import { Typography, TypographyProps } from '@mui/material';
import { useResponsive } from '@/hooks/useResponsive';
import { getResponsiveTypography } from '@/config/responsive';

interface ResponsiveTextProps extends Omit<TypographyProps, 'variant'> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption';
  children: React.ReactNode;
  responsive?: boolean;
}

export function ResponsiveText({
  variant = 'body1',
  children,
  responsive = true,
  sx,
  ...props
}: ResponsiveTextProps) {
  const { screenWidth } = useResponsive();
  
  const fontSize = responsive 
    ? getResponsiveTypography(variant, screenWidth)
    : undefined;

  return (
    <Typography
      variant={variant}
      sx={{
        ...(fontSize && { fontSize }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}