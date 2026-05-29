/**
 * 响应式按钮组件
 * 根据屏幕尺寸自动调整按钮大小和样式
 * 
 * 应用苹果毛玻璃风格（Glassmorphism）
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { Button, ButtonProps, IconButton, IconButtonProps } from '@mui/material';
import { useResponsive, useTouchDevice } from '@/hooks/useResponsive';
import { getButtonStyles } from '@/config/responsive';
import { getGlassConfig } from '@/config/glassConfig';
import { useStyleStore } from '@/store';

interface ResponsiveButtonProps extends ButtonProps {
  responsive?: boolean;
  touchOptimized?: boolean;
  glassEffect?: boolean;
  glassVariant?: 'primary' | 'secondary';
}

interface ResponsiveIconButtonProps extends IconButtonProps {
  responsive?: boolean;
  touchOptimized?: boolean;
  glassEffect?: boolean;
}

export function ResponsiveButton({
  responsive = true,
  touchOptimized = true,
  glassEffect = true,
  glassVariant = 'primary',
  sx,
  children,
  ...props
}: ResponsiveButtonProps) {
  const { screenWidth, isMobile } = useResponsive();
  const isTouch = useTouchDevice();
  const isClassicStyle = useStyleStore((state) => state.style) === 'classic';
  
  const buttonStyles = responsive 
    ? getButtonStyles(screenWidth)
    : { height: '40px', padding: '8px 16px', fontSize: '0.875rem' };

  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);
  const buttonConfig = glassConfig.components.button[glassVariant];

  // 构建毛玻璃样式
  const glassEffectStyles = glassEffect ? {
    backdropFilter: isClassicStyle ? 'var(--app-backdrop-light)' : `blur(${buttonConfig.blur})`,
    WebkitBackdropFilter: isClassicStyle ? 'var(--app-backdrop-light)' : `blur(${buttonConfig.blur})`,
    backgroundColor: isClassicStyle
      ? 'var(--app-interactive-bg-soft)'
      : `rgba(var(--glass-surface-rgb), ${buttonConfig.bgOpacity})`,
    border: isClassicStyle ? 'var(--app-panel-border)' : `${glassConfig.border.width} solid ${glassConfig.border.color}`,
    boxShadow: isClassicStyle ? 'var(--app-panel-shadow-sm)' : glassConfig.shadow.sm,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
    '&:hover': {
      backgroundColor: isClassicStyle
        ? 'var(--app-interactive-hover-bg)'
        : `rgba(var(--glass-surface-rgb), ${Math.min(buttonConfig.bgOpacity + 0.1, 0.95)})`,
      boxShadow: isClassicStyle ? 'var(--app-panel-shadow-md)' : glassConfig.shadow.md,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      backgroundColor: isClassicStyle
        ? 'var(--app-interactive-active-bg)'
        : `rgba(var(--glass-surface-rgb), ${Math.max(buttonConfig.bgOpacity - 0.05, 0.3)})`,
      boxShadow: isClassicStyle ? 'var(--app-panel-shadow-sm)' : glassConfig.shadow.sm,
      transform: 'translateY(0)',
    },
  } : {};

  return (
    <Button
      sx={{
        ...(responsive && {
          height: buttonStyles.height,
          padding: buttonStyles.padding,
          fontSize: buttonStyles.fontSize,
        }),
        ...(touchOptimized && isTouch && {
          minHeight: '44px',
          minWidth: '44px',
        }),
        ...(isMobile && {
          borderRadius: glassEffect ? glassConfig.border.radius.md : '8px',
          fontWeight: 500,
        }),
        // 应用毛玻璃效果
        ...glassEffectStyles,
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
  glassEffect = true,
  sx,
  children,
  ...props
}: ResponsiveIconButtonProps) {
  const { screenWidth, isMobile } = useResponsive();
  const isTouch = useTouchDevice();
  const isClassicStyle = useStyleStore((state) => state.style) === 'classic';
  
  const buttonStyles = responsive 
    ? getButtonStyles(screenWidth)
    : { height: '40px', padding: '8px 16px', fontSize: '0.875rem' };

  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);
  const iconConfig = glassConfig.components.button.icon;

  // 构建毛玻璃样式
  const glassEffectStyles = glassEffect ? {
    backdropFilter: isClassicStyle ? 'var(--app-backdrop-light)' : `blur(${iconConfig.blur})`,
    WebkitBackdropFilter: isClassicStyle ? 'var(--app-backdrop-light)' : `blur(${iconConfig.blur})`,
    backgroundColor: isClassicStyle
      ? 'var(--app-interactive-bg-soft)'
      : `rgba(var(--glass-surface-rgb), ${iconConfig.bgOpacity})`,
    border: isClassicStyle ? 'var(--app-panel-border)' : `${glassConfig.border.width} solid ${glassConfig.border.color}`,
    boxShadow: isClassicStyle ? 'var(--app-panel-shadow-sm)' : glassConfig.shadow.sm,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
    '&:hover': {
      backgroundColor: isClassicStyle
        ? 'var(--app-interactive-hover-bg)'
        : `rgba(var(--glass-surface-rgb), ${Math.min(iconConfig.bgOpacity + 0.15, 0.95)})`,
      boxShadow: isClassicStyle ? 'var(--app-panel-shadow-md)' : glassConfig.shadow.md,
      transform: 'scale(1.05)',
    },
    '&:active': {
      backgroundColor: isClassicStyle
        ? 'var(--app-interactive-active-bg)'
        : `rgba(var(--glass-surface-rgb), ${Math.max(iconConfig.bgOpacity - 0.05, 0.2)})`,
      boxShadow: isClassicStyle ? 'var(--app-panel-shadow-sm)' : glassConfig.shadow.sm,
      transform: 'scale(0.95)',
    },
  } : {};

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
          borderRadius: glassEffect ? glassConfig.border.radius.md : '8px',
        }),
        // 应用毛玻璃效果
        ...glassEffectStyles,
        ...sx,
      }}
      {...props}
    >
      {children}
    </IconButton>
  );
}
