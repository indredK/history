/**
 * 设置面板组件
 * Settings Panel Component
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { Box, Stack } from '@mui/material';
import { ThemeToggleButton } from './ThemeToggleButton';
import { LanguageSwitcherButton } from './LanguageSwitcherButton';
import { useResponsive } from '@/hooks';
import { getGlassConfig } from '@/config/glassConfig';

interface SettingsPanelProps {
  /** 是否为折叠状态 */
  collapsed: boolean;
}

export function SettingsPanel({ collapsed }: SettingsPanelProps) {
  const { screenWidth } = useResponsive();
  const glassConfig = getGlassConfig(screenWidth);

  // 毛玻璃面板样式
  const panelStyle = {
    backdropFilter: `blur(${glassConfig.blur.light})`,
    WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
    background: 'var(--theme-glass-bg-light)',
    border: '1px solid var(--theme-glass-border)',
    borderRadius: glassConfig.border.radius.lg,
    padding: collapsed ? '4px' : '8px',
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
  };

  // 折叠状态下垂直排列，展开状态下水平排列
  return (
    <Box sx={panelStyle}>
      <Stack 
        direction={collapsed ? 'column' : 'row'}
        spacing={1} 
        justifyContent="center"
        alignItems="center"
      >
        <ThemeToggleButton collapsed={collapsed} />
        <LanguageSwitcherButton collapsed={collapsed} />
      </Stack>
    </Box>
  );
}
