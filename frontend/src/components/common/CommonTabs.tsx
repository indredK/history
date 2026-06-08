/**
 * 通用标签页组件
 * Common Tabs Component
 * 
 * 统一的标签页样式，适用于所有需要标签切换的页面
 */

import { Box, Tabs, Tab } from '@mui/material';

/**
 * 标签配置
 */
export interface CommonTabItem {
  value: string;
  label: string;
  icon?: React.ReactElement | undefined;
}

/**
 * CommonTabs 组件属性
 */
export interface CommonTabsProps {
  /** 标签配置列表 */
  tabs: CommonTabItem[];
  /** 当前激活的标签值 */
  value: string;
  /** 标签切换回调 */
  onChange: (value: string) => void;
  /** aria-label */
  ariaLabel?: string;
  /** 是否显示底部边框，默认 true */
  showBorder?: boolean;
  /** 底部间距，默认 0 */
  marginBottom?: number;
  /** MUI Tabs variant */
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  /** 是否显示滚动按钮 */
  scrollButtons?: boolean | 'auto';
  /** 移动端是否允许显示滚动按钮 */
  allowScrollButtonsMobile?: boolean;
}

/**
 * 统一的标签页样式
 */
const tabsStyles = {
  minHeight: 44,
  '& .MuiTabs-indicator': {
    background: 'var(--color-primary-gradient)',
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTab-root': {
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
    fontSize: '0.9rem',
    textTransform: 'none',
    minHeight: 44,
    minWidth: 'auto',
    px: 2,
    py: 1,
    gap: 0.5,
    borderRadius: '10px',
    margin: '0 4px',
    transition: 'all 0.2s ease',
    '&.Mui-selected': {
      color: 'var(--color-primary)',
      fontWeight: 600,
      backgroundColor: 'rgba(var(--glass-tint-rgb, 100, 150, 255), 0.1)',
    },
    '&:hover': {
      color: 'var(--color-primary)',
      backgroundColor: 'rgba(var(--glass-tint-rgb, 100, 150, 255), 0.08)',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1.1rem',
    },
  },
};

/**
 * 通用标签页组件
 */
export function CommonTabs({
  tabs,
  value,
  onChange,
  ariaLabel = '标签页导航',
  showBorder = true,
  marginBottom = 0,
  variant = 'scrollable',
  scrollButtons = false,
  allowScrollButtonsMobile = false,
}: CommonTabsProps) {
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Box
      sx={{
        ...(showBorder && {
          borderBottom: '1px solid var(--color-border-light)',
        }),
        ...(marginBottom > 0 && { mb: marginBottom }),
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label={ariaLabel}
        variant={variant}
        scrollButtons={scrollButtons}
        allowScrollButtonsMobile={allowScrollButtonsMobile}
        sx={tabsStyles}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            {...(tab.icon && { icon: tab.icon, iconPosition: 'start' as const })}
          />
        ))}
      </Tabs>
    </Box>
  );
}

export default CommonTabs;
