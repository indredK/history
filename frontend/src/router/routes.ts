import { lazy, ComponentType } from 'react';

export interface RouteConfig {
  key: string;
  path: string;
  label: string;
  component: React.LazyExoticComponent<ComponentType>;
  index?: boolean;
}

// 懒加载页面组件
const TimelinePage = lazy(() => import('../pages/TimelinePage'));
const MapPage = lazy(() => import('../pages/MapPage'));
const PeoplePage = lazy(() => import('../pages/PeoplePage'));
const CulturePage = lazy(() => import('../pages/CulturePage'));
const MythologyPage = lazy(() => import('../pages/MythologyPage'));
const DynastiesPage = lazy(() => import('../pages/DynastiesPage'));
const DynastyBoundariesPage = lazy(() => import('../pages/DynastyBoundariesPage'));
const EmperorsCyberPage = lazy(() => import('../pages/EmperorsCyberPage'));

export const routes: RouteConfig[] = [
  {
    key: 'map',
    path: '/map',
    label: '历史地图',
    component: MapPage,
    index: true,
  },
  {
    key: 'people',
    path: '/people',
    label: '人物',
    component: PeoplePage,
  },
  {
    key: 'mythology',
    path: '/mythology',
    label: '神话',
    component: MythologyPage,
  },
  {
    key: 'culture',
    path: '/culture',
    label: '文化',
    component: CulturePage,
  },
  {
    key: 'dynasties',
    path: '/dynasties',
    label: '朝代',
    component: DynastiesPage,
  },
  {
    key: 'timeline',
    path: '/timeline',
    label: '时间轴',
    component: TimelinePage,
  },
  {
    key: 'dynasty-boundaries',
    path: '/dynasty-boundaries',
    label: '疆域',
    component: DynastyBoundariesPage,
  },
  {
    key: 'emperors-cyber',
    path: '/emperors-cyber',
    label: '帝王',
    component: EmperorsCyberPage,
  },
];
