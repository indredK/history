/**
 * 设置面板组件
 * Settings Panel Component
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { Box, Stack } from '@mui/material';
import { ThemeToggleButton } from './ThemeToggleButton';
import { LanguageSwitcherButton } from './LanguageSwitcherButton';
import { StyleSwitcherButton } from './StyleSwitcherButton';
import { DataSourceIndicator } from '@/components/DataSourceIndicator';
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
    backdropFilter: 'var(--app-backdrop-light)',
    WebkitBackdropFilter: 'var(--app-backdrop-light)',
    background: 'var(--app-panel-bg-soft)',
    border: 'var(--app-panel-border)',
    borderRadius: glassConfig.border.radius.lg,
    padding: collapsed ? '4px' : '8px',
    boxShadow: 'var(--app-panel-shadow-sm)',
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
  };

  // 折叠状态下垂直排列，展开状态下水平排列
  return (
    <Box sx={panelStyle}>
      <Stack
        direction={collapsed ? 'column' : 'row'}
        spacing={1}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <ThemeToggleButton collapsed={collapsed} />
        <StyleSwitcherButton collapsed={collapsed} />
        <LanguageSwitcherButton collapsed={collapsed} />
        <DataSourceIndicator collapsed={collapsed} />
      </Stack>
    </Box>
  );
}
