/**
 * 人物页面标签切换组件
 */

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import CastleIcon from '@mui/icons-material/Castle';
import { CommonTabs, type CommonTabItem } from '@/components/common';

export type PeopleTabValue = 'emperors' | 'ming' | 'qing';

interface PeopleTabsProps {
  activeTab: PeopleTabValue;
  onTabChange: (tab: PeopleTabValue) => void;
}

const tabs: CommonTabItem[] = [
  { value: 'emperors', label: '历代帝王', icon: <AccountBalanceIcon /> },
  { value: 'ming', label: '明朝人物', icon: <HistoryEduIcon /> },
  { value: 'qing', label: '清朝人物', icon: <CastleIcon /> },
];

export function PeopleTabs({ activeTab, onTabChange }: PeopleTabsProps) {
  return <CommonTabs tabs={tabs} value={activeTab} onChange={(value) => onTabChange(value as PeopleTabValue)} ariaLabel="人物页面标签" marginBottom={3} />;
}

export default PeopleTabs;
