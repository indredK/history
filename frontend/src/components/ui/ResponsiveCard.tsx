/**
 * 响应式卡片组件
 * 根据屏幕尺寸自动调整卡片样式
 * 
 * 应用苹果毛玻璃风格（Glassmorphism）
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { useState } from 'react';
import { Card, CardProps, CardContent, CardActions, CardHeader } from '@mui/material';
import { useResponsive } from '@/hooks/useResponsive';
import { useComponentGlassStyle } from '@/hooks/useGlassStyle';
import { getCardStyles } from '@/config/responsive';

interface ResponsiveCardProps extends CardProps {
  responsive?: boolean;
  glassEffect?: boolean;
  children: React.ReactNode;
}

interface ResponsiveCardContentProps {
  children: React.ReactNode;
  disablePadding?: boolean;
}

interface ResponsiveCardActionsProps {
  children: React.ReactNode;
  spacing?: 'compact' | 'normal' | 'comfortable';
}

interface ResponsiveCardHeaderProps {
  title?: React.ReactNode;
  subheader?: React.ReactNode;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
}

export function ResponsiveCard({
  responsive = true,
  glassEffect = true,
  sx,
  children,
  ...props
}: ResponsiveCardProps) {
  const { screenWidth, isMobile } = useResponsive();
  const [isHovered, setIsHovered] = useState(false);
  
  // 获取毛玻璃样式
  const { style: glassStyle, hoverStyle } = useComponentGlassStyle('card');
  
  const cardStyles = responsive 
    ? getCardStyles(screenWidth)
    : { padding: '16px', borderRadius: '8px', margin: '8px' };

  // 构建毛玻璃样式对象
  const glassEffectStyles = glassEffect ? {
    backdropFilter: glassStyle.backdropFilter as string,
    WebkitBackdropFilter: glassStyle.WebkitBackdropFilter as string,
    backgroundColor: (isHovered && hoverStyle ? hoverStyle.backgroundColor : glassStyle.backgroundColor) as string,
    border: glassStyle.border as string,
    borderRadius: glassStyle.borderRadius as string,
    boxShadow: (isHovered && hoverStyle ? hoverStyle.boxShadow : glassStyle.boxShadow) as string,
    transition: glassStyle.transition as string,
    background: 'transparent',
  } : {};

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        ...(responsive && {
          padding: cardStyles.padding,
          borderRadius: cardStyles.borderRadius,
          margin: cardStyles.margin,
        }),
        // 应用毛玻璃效果
        ...glassEffectStyles,
        ...(isMobile && !glassEffect && {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
}

export function ResponsiveCardContent({
  children,
  disablePadding = false,
}: ResponsiveCardContentProps) {
  const { isMobile, isSmallMobile } = useResponsive();

  return (
    <CardContent
      sx={{
        padding: disablePadding 
          ? 0 
          : isMobile 
            ? isSmallMobile ? '8px' : '12px'
            : '16px',
        '&:last-child': {
          paddingBottom: disablePadding 
            ? 0 
            : isMobile 
              ? isSmallMobile ? '8px' : '12px'
              : '16px',
        },
      }}
    >
      {children}
    </CardContent>
  );
}

export function ResponsiveCardActions({
  children,
  spacing = 'normal',
}: ResponsiveCardActionsProps) {
  const { isMobile, isSmallMobile } = useResponsive();

  const getSpacing = () => {
    if (spacing === 'compact') return isMobile ? '4px' : '8px';
    if (spacing === 'comfortable') return isMobile ? '12px' : '16px';
    return isMobile ? '8px' : '12px'; // normal
  };

  return (
    <CardActions
      sx={{
        padding: getSpacing(),
        gap: isSmallMobile ? '4px' : '8px',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
      }}
    >
      {children}
    </CardActions>
  );
}

export function ResponsiveCardHeader({
  title,
  subheader,
  action,
  avatar,
}: ResponsiveCardHeaderProps) {
  const { isMobile, isSmallMobile } = useResponsive();

  return (
    <CardHeader
      title={title}
      subheader={subheader}
      action={action}
      avatar={avatar}
      sx={{
        padding: isMobile 
          ? isSmallMobile ? '8px' : '12px'
          : '16px',
        '& .MuiCardHeader-title': {
          fontSize: isMobile 
            ? isSmallMobile ? '0.9rem' : '1rem'
            : '1.1rem',
          fontWeight: 600,
        },
        '& .MuiCardHeader-subheader': {
          fontSize: isMobile 
            ? isSmallMobile ? '0.7rem' : '0.8rem'
            : '0.9rem',
        },
        '& .MuiCardHeader-action': {
          margin: 0,
          alignSelf: 'center',
        },
      }}
    />
  );
}