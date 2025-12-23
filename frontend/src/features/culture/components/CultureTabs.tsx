/**
 * 文化页面标签切换组件
 * Culture Tabs Component
 * 
 * 在"思想流派"和"文化名人"之间切换
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import { CommonTabs, type CommonTabItem } from '@/components/common';

type TabValue = 'schools' | 'scholars';

interface CultureTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

const tabs: CommonTabItem[] = [
  {
    value: 'schools',
    label: '思想流派',
    icon: <MenuBookIcon />,
  },
  {
    value: 'scholars',
    label: '文化名人',
    icon: <PersonIcon />,
  },
];

/**
 * 文化页面标签切换组件
 */
export function CultureTabs({ activeTab, onTabChange }: CultureTabsProps) {
  return (
    <CommonTabs
      tabs={tabs}
      value={activeTab}
      onChange={(value) => onTabChange(value as TabValue)}
      ariaLabel="文化页面标签"
      marginBottom={3}
    />
  );
}

export default CultureTabs;
