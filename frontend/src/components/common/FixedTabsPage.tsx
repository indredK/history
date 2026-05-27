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
import { PagePanel } from './PagePanel';
import { SectionToolbar } from './SectionToolbar';
import { PerformanceMonitor } from '@/utils/performance';

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

function hasTab(
  tabs: TabConfig[],
  value?: string | null,
): value is string {
  return Boolean(value) && tabs.some((tab) => tab.value === value);
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
  const requestedTabIsValid = hasTab(tabs, requestedTab);
  const defaultTabIsValid = hasTab(tabs, defaultTab);
  const firstTab = tabs[0]?.value || '';
  const [activeTab, setActiveTab] = useState<string>(
    requestedTabIsValid
      ? requestedTab
      : defaultTabIsValid
        ? defaultTab
        : firstTab
  );

  const handleTabChange = (newValue: string) => {
    if (newValue === activeTab) {
      return;
    }
    setActiveTab(newValue);
    setSearchParams(
      (prevParams) => {
        const nextParams = new URLSearchParams(prevParams);
        nextParams.set(queryKey, newValue);
        return nextParams;
      },
      { replace: true },
    );
    onTabChange?.(newValue);
  };

  useEffect(() => {
    if (requestedTabIsValid && requestedTab !== activeTab) {
      setActiveTab(requestedTab);
      return;
    }

    if (tabs.some((tab) => tab.value === activeTab)) {
      return;
    }

    const fallbackTab = requestedTabIsValid
      ? requestedTab
      : defaultTabIsValid
        ? defaultTab
        : firstTab;

    if (fallbackTab !== activeTab) {
      setActiveTab(fallbackTab);
    }
  }, [
    activeTab,
    defaultTab,
    defaultTabIsValid,
    firstTab,
    requestedTab,
    requestedTabIsValid,
    tabs,
  ]);

  useEffect(() => {
    if (!activeTab) {
      return;
    }

    PerformanceMonitor.getInstance().mark(`fixed-tabs:${activeTab}`);
    const timer = window.setTimeout(() => {
      PerformanceMonitor.getInstance().measure(`fixed-tabs:${activeTab}`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    if (
      !activeTab ||
      !requestedTab ||
      requestedTabIsValid ||
      requestedTab === activeTab
    ) {
      return;
    }

    setSearchParams(
      (prevParams) => {
        const nextParams = new URLSearchParams(prevParams);
        nextParams.set(queryKey, activeTab);
        return nextParams;
      },
      { replace: true },
    );
  }, [activeTab, queryKey, requestedTab, requestedTabIsValid, setSearchParams]);

  const activeTabConfig = tabs.find((tab) => tab.value === activeTab);

  const tabItems: CommonTabItem[] = tabs.map((tab) => ({
    value: tab.value,
    label: tab.label,
    icon: tab.icon,
  }));

  return (
    <PagePanel
      title={title}
      description={description}
      className={className}
      contentSx={{ overflow: 'hidden' }}
    >
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
    </PagePanel>
  );
}

export default FixedTabsPage;
