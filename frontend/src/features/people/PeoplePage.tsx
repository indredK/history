/**
 * 人物页面主组件
 * People Page Component
 * 
 * 重构后的人物页面，包含多个标签页：历代帝王、三国人物、唐朝人物、宋朝人物、元朝人物、明朝人物、清朝人物
 * 使用公共的FixedTabsPage组件
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 6.4
 */

import { lazy, Suspense } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import CastleIcon from '@mui/icons-material/Castle';
import GroupsIcon from '@mui/icons-material/Groups';
import TempleBuddhistIcon from '@mui/icons-material/TempleBuddhist';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FortIcon from '@mui/icons-material/Fort';

import { FixedTabsPage, type FixedTabConfig } from '@/components/common';
import { GridSkeleton } from './components';
import './PeoplePage.css';

// 懒加载标签页内容组件
const EmperorsContent = lazy(() => import('./components/emperors/EmperorsContent'));
const SanguoContent = lazy(() => import('./components/sanguo/SanguoContent'));
const TangContent = lazy(() => import('./components/tang/TangContent'));
const SongContent = lazy(() => import('./components/song/SongContent'));
const YuanContent = lazy(() => import('./components/yuan/YuanContent'));
const MingContent = lazy(() => import('./components/ming/MingContent'));
const QingContent = lazy(() => import('./components/qing/QingContent'));

/**
 * 人物页面主组件
 */
function PeoplePage() {
  // 定义标签页配置
  const tabs: FixedTabConfig[] = [
    {
      value: 'emperors',
      label: '历代帝王',
      icon: <AccountBalanceIcon />,
      content: (
        <Suspense fallback={<GridSkeleton />}>
          <EmperorsContent />
        </Suspense>
      ),
    },
    {
      value: 'sanguo',
      label: '三国人物',
      icon: <GroupsIcon />,
      content: (
        <Suspense fallback={<GridSkeleton />}>
          <SanguoContent />
        </Suspense>
      ),
    },
    {
      value: 'tang',
      label: '唐朝人物',
      icon: <TempleBuddhistIcon />,
      content: (
        <Suspense fallback={<GridSkeleton />}>
          <TangContent />
        </Suspense>
      ),
    },
    {
      value: 'song',
      label: '宋朝人物',
      icon: <AutoStoriesIcon />,
      content: (
        <Suspense fallback={<GridSkeleton />}>
          <SongContent />
        </Suspense>
      ),
    },
    {
      value: 'yuan',
      label: '元朝人物',
      icon: <FortIcon />,
      content: (
        <Suspense fallback={<GridSkeleton />}>
          <YuanContent />
        </Suspense>
      ),
    },
    {
      value: 'ming',
      label: '明朝人物',
      icon: <HistoryEduIcon />,
      content: (
        <Suspense fallback={<GridSkeleton />}>
          <MingContent />
        </Suspense>
      ),
    },
    {
      value: 'qing',
      label: '清朝人物',
      icon: <CastleIcon />,
      content: (
        <Suspense fallback={<GridSkeleton />}>
          <QingContent />
        </Suspense>
      ),
    },
  ];

  return (
    <FixedTabsPage
      tabs={tabs}
      defaultTab="emperors"
      className="people-page"
      tabsProps={{
        variant: 'scrollable',
        scrollButtons: 'auto',
      }}
    />
  );
}

export default PeoplePage;