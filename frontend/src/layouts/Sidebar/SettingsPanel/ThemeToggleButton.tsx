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
  const buttonSize = collapsed ? 32 : 40;
  
  // 毛玻璃按钮样式
  const buttonStyle = {
    backdropFilter: 'var(--app-backdrop-light)',
    WebkitBackdropFilter: 'var(--app-backdrop-light)',
    background: 'var(--app-interactive-bg-soft)',
    border: '1px solid var(--app-interactive-border)',
    borderRadius: glassConfig.border.radius.md,
    color: 'var(--app-interactive-text)',
    width: buttonSize,
    height: buttonSize,
    minWidth: buttonSize,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
    '&:hover': {
      background: 'var(--app-interactive-hover-bg)',
      boxShadow: 'var(--app-panel-shadow-sm)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(-1px) scale(0.92)',
    },
  };

  return (
    <Tooltip title={label} placement={collapsed ? 'right' : 'top'}>
      <IconButton
        onClick={toggleTheme}
        sx={buttonStyle}
        aria-label={label}
      >
        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
