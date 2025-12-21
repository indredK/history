/**
 * 主题切换按钮组件
 * Theme Toggle Button Component
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeStore } from '@/store';
import { useResponsive } from '@/hooks';
import { getGlassConfig } from '@/config/glassConfig';

interface ThemeToggleButtonProps {
  /** 是否为折叠状态 */
  collapsed: boolean;
}

export function ThemeToggleButton({ collapsed }: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { screenWidth } = useResponsive();
  const glassConfig = getGlassConfig(screenWidth);
  
  const isDark = theme === 'dark';
  const label = isDark ? '切换到白天模式' : '切换到暗黑模式';
  
  // 折叠状态下使用更小的按钮尺寸
  const buttonSize = collapsed ? 36 : 44;
  
  // 毛玻璃按钮样式
  const buttonStyle = {
    backdropFilter: `blur(${glassConfig.blur.light})`,
    WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
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

  return (
    <Tooltip title={label} placement={collapsed ? 'right' : 'top'}>
      <IconButton
        onClick={toggleTheme}
        sx={buttonStyle}
        aria-label={label}
      >
        {isDark ? <LightModeIcon fontSize={collapsed ? 'small' : 'medium'} /> : <DarkModeIcon fontSize={collapsed ? 'small' : 'medium'} />}
      </IconButton>
    </Tooltip>
  );
}
