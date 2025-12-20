/**
 * 响应式按钮组件
 * 根据屏幕尺寸自动调整按钮大小和样式
 */

import { Button, ButtonProps, IconButton, IconButtonProps } from '@mui/material';
import { useResponsive, useTouchDevice } from '@/hooks/useResponsive';
import { getButtonStyles } from '@/config/responsive';

interface ResponsiveButtonProps extends ButtonProps {
  responsive?: boolean;
  touchOptimized?: boolean;
}

interface ResponsiveIconButtonProps extends IconButtonProps {
  responsive?: boolean;
  touchOptimized?: boolean;
}

export function ResponsiveButton({
  responsive = true,
  touchOptimized = true,
  sx,
  children,
  ...props
}: ResponsiveButtonProps) {
  const { screenWidth, isMobile } = useResponsive();
  const isTouch = useTouchDevice();
  
  const buttonStyles = responsive 
    ? getButtonStyles(screenWidth)
    : { height: '40px', padding: '8px 16px', fontSize: '0.875rem' };

  return (
    <Button
      sx={{
        ...(responsive && {
          height: buttonStyles.height,
          padding: buttonStyles.padding,
          fontSize: buttonStyles.fontSize,
        }),
        ...(touchOptimized && isTouch && {
          minHeight: '44px', // 触摸目标最小尺寸
          minWidth: '44px',
        }),
        ...(isMobile && {
          borderRadius: '8px',
          fontWeight: 500,
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function ResponsiveIconButton({
  responsive = true,
  touchOptimized = true,
  sx,
  children,
  ...props
}: ResponsiveIconButtonProps) {
  const { screenWidth, isMobile } = useResponsive();
  const isTouch = useTouchDevice();
  
  const buttonStyles = responsive 
    ? getButtonStyles(screenWidth)
    : { height: '40px', padding: '8px 16px', fontSize: '0.875rem' };

  return (
    <IconButton
      sx={{
        ...(responsive && {
          width: buttonStyles.height,
          height: buttonStyles.height,
        }),
        ...(touchOptimized && isTouch && {
          minHeight: '44px',
          minWidth: '44px',
        }),
        ...(isMobile && {
          borderRadius: '8px',
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </IconButton>
  );
}