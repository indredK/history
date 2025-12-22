/**
 * 样式切换按钮组件
 * Style Switcher Button Component
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 * 
 * 支持毛玻璃样式和经典样式之间的切换
 */

import { IconButton, Tooltip } from '@mui/material';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import BlurOffIcon from '@mui/icons-material/BlurOff';
import { useStyleStore } from '@/store';
import { useResponsive } from '@/hooks';
import { getGlassConfig } from '@/config/glassConfig';

interface StyleSwitcherButtonProps {
  /** 是否为折叠状态 */
  collapsed: boolean;
}

export function StyleSwitcherButton({ collapsed }: StyleSwitcherButtonProps) {
  const { style, toggleStyle } = useStyleStore();
  const { screenWidth } = useResponsive();
  const glassConfig = getGlassConfig(screenWidth);
  
  const isGlass = style === 'glass';
  const label = isGlass ? '切换到经典样式' : '切换到毛玻璃样式';
  
  // 折叠状态下使用更小的按钮尺寸
  const buttonSize = collapsed ? 36 : 44;
  
  // 按钮样式 - 根据当前样式模式调整
  const buttonStyle = {
    backdropFilter: isGlass ? `blur(${glassConfig.blur.light})` : 'none',
    WebkitBackdropFilter: isGlass ? `blur(${glassConfig.blur.light})` : 'none',
    background: 'var(--theme-glass-bg-light)',
    border: '1px solid var(--theme-glass-border)',
    borderRadius: glassConfig.border.radius.md,
    color: 'var(--theme-icon-primary)',
    width: buttonSize,
    height: buttonSize,
    minWidth: buttonSize,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
    '&:hover': {
      background: 'var(--theme-glass-bg)',
      boxShadow: glassConfig.shadow.glow,
    },
  };

  const handleClick = () => {
    // 添加过渡类以实现平滑切换
    document.documentElement.classList.add('style-transitioning');
    
    toggleStyle();
    
    // 过渡完成后移除类
    setTimeout(() => {
      document.documentElement.classList.remove('style-transitioning');
    }, 200);
  };

  return (
    <Tooltip title={label} placement={collapsed ? 'right' : 'top'}>
      <IconButton
        onClick={handleClick}
        sx={buttonStyle}
        aria-label={label}
      >
        {isGlass ? (
          <BlurOnIcon fontSize={collapsed ? 'small' : 'medium'} />
        ) : (
          <BlurOffIcon fontSize={collapsed ? 'small' : 'medium'} />
        )}
      </IconButton>
    </Tooltip>
  );
}
