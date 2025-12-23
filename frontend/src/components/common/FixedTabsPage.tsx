/**
 * 固定标签页页面组件
 * Fixed Tabs Page Component
 * 
 * 提供固定标签栏的页面结构，标签栏固定在顶部，内容区域可滚动
 * 适用于人物页面、文化页面等需要固定标签页的场景
 */

import { useState, ReactNode, useEffect } from 'react';
import { Box } from '@mui/material';
import { CommonTabs, type CommonTabItem } from './CommonTabs';

export interface TabConfig {
  value: string;
  label: string;
  icon?: React.ReactElement;
  content: ReactNode;
}

interface FixedTabsPageProps {
  tabs: TabConfig[];
  defaultTab?: string;
  className?: string;
  onTabChange?: (tabValue: string) => void;
  tabsProps?: {
    variant?: 'standard' | 'scrollable' | 'fullWidth';
    scrollButtons?: boolean | 'auto';
    allowScrollButtonsMobile?: boolean;
  };
}

/**
 * 固定标签页页面组件
 */
export function FixedTabsPage({
  tabs,
  defaultTab,
  className = '',
  onTabChange,
}: FixedTabsPageProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0]?.value || ''
  );

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onTabChange?.(newValue);
  };

  // 当tabs变化时，确保activeTab是有效的
  useEffect(() => {
    if (!tabs.find(tab => tab.value === activeTab)) {
      const firstTab = tabs[0]?.value;
      if (firstTab) {
        setActiveTab(firstTab);
      }
    }
  }, [tabs, activeTab]);

  const activeTabConfig = tabs.find(tab => tab.value === activeTab);

  // 转换为 CommonTabItem 格式
  const tabItems: CommonTabItem[] = tabs.map(tab => ({
    value: tab.value,
    label: tab.label,
    icon: tab.icon,
  }));

  return (
    <Box 
      className={className}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 页面头部区域 - 固定在顶部 */}
      <Box
        sx={{
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--color-bg-primary)',
          mb: 2,
        }}
      >
        <CommonTabs
          tabs={tabItems}
          value={activeTab}
          onChange={handleTabChange}
          ariaLabel="标签页导航"
        />
      </Box>

      {/* 页面内容区域 - 可滚动 */}
      <Box
        key={activeTab}
        sx={{
          flex: 1,
          overflow: 'auto',
          pr: 1, // 为滚动条留出空间
          animation: 'tabContentEnter 0.4s ease-out',
          '@keyframes tabContentEnter': {
            from: {
              opacity: 0,
              transform: 'scale(0.98)',
            },
            to: {
              opacity: 1,
              transform: 'scale(1)',
            },
          },
        }}
      >
        {activeTabConfig?.content}
      </Box>
    </Box>
  );
}

export default FixedTabsPage;
