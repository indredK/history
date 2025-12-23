/**
 * 通用标签页容器组件
 * Generic Tabs Container Component
 * 
 * 提供标签页切换和内容渲染的通用结构
 * 可用于人物页面、文化页面等需要标签页的场景
 */

import { useState, ReactNode } from 'react';
import { Box } from '@mui/material';
import { CommonTabs, type CommonTabItem } from './CommonTabs';

export interface TabConfig {
  value: string;
  label: string;
  icon?: React.ReactElement;
  content: ReactNode;
}

interface TabsContainerProps {
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
 * 通用标签页容器组件
 */
export function TabsContainer({
  tabs,
  defaultTab,
  className = '',
  onTabChange,
}: TabsContainerProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0]?.value || ''
  );

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onTabChange?.(newValue);
  };

  const activeTabConfig = tabs.find(tab => tab.value === activeTab);

  // 转换为 CommonTabItem 格式
  const tabItems: CommonTabItem[] = tabs.map(tab => ({
    value: tab.value,
    label: tab.label,
    icon: tab.icon,
  }));

  return (
    <Box className={className}>
      {/* 标签页头部 - 固定在顶部 */}
      <Box
        sx={{
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

      {/* 标签页内容区域 - 可滚动 */}
      <Box
        key={activeTab}
        sx={{
          flex: 1,
          overflow: 'auto',
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

export default TabsContainer;
