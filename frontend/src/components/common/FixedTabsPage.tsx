/**
 * 固定标签页页面组件
 * Fixed Tabs Page Component
 * 
 * 提供固定标签栏的页面结构，标签栏固定在顶部，内容区域可滚动
 * 适用于人物页面、文化页面等需要固定标签页的场景
 */

import { useState, ReactNode, useEffect } from 'react';
import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { CommonTabs, type CommonTabItem } from './CommonTabs';
import { PageIntro } from './PageIntro';
import { SectionToolbar } from './SectionToolbar';

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
  title?: string;
  description?: string;
  onTabChange?: (tabValue: string) => void;
  queryKey?: string;
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
  title,
  description,
  onTabChange,
  queryKey = 'tab',
}: FixedTabsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get(queryKey);
  const [activeTab, setActiveTab] = useState<string>(
    requestedTab && tabs.some((tab) => tab.value === requestedTab)
      ? requestedTab
      : defaultTab || tabs[0]?.value || ''
  );

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(queryKey, newValue);
    setSearchParams(nextParams, { replace: true });
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

  useEffect(() => {
    if (!requestedTab || requestedTab === activeTab) {
      return;
    }
    if (tabs.some((tab) => tab.value === requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [activeTab, requestedTab, tabs]);

  useEffect(() => {
    if (!activeTab) {
      return;
    }
    if (searchParams.get(queryKey) === activeTab) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(queryKey, activeTab);
    setSearchParams(nextParams, { replace: true });
  }, [activeTab, queryKey, searchParams, setSearchParams]);

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
        background: 'var(--app-panel-bg-soft)',
        border: 'var(--app-panel-border)',
        borderRadius: 'var(--panel-radius)',
        boxShadow: 'var(--app-panel-shadow-md)',
        p: { xs: 1.5, md: 2 },
      }}
    >
      <PageIntro title={title} description={description} />

      {/* 页面头部区域 - 固定在顶部 */}
      <SectionToolbar>
        <CommonTabs
          tabs={tabItems}
          value={activeTab}
          onChange={handleTabChange}
          ariaLabel="标签页导航"
        />
      </SectionToolbar>

      {/* 页面内容区域 - 可滚动 */}
      <Box
        key={activeTab}
        sx={{
          flex: 1,
          overflow: 'auto',
          pr: 1,
          pl: 0.5,
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
