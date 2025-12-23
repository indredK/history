import { lazy, ComponentType } from 'react';

export interface RouteConfig {
  key: string;
  path: string;
  label: string;
  component: React.LazyExoticComponent<ComponentType<any>>;
  index?: boolean;
}

// 懒加载页面组件
const TimelinePage = lazy(() => import('../pages/TimelinePage'));
const MapPage = lazy(() => import('../pages/MapPage'));
const PeoplePage = lazy(() => import('../pages/PeoplePage'));
const CulturePage = lazy(() => import('../pages/CulturePage'));
const MythologyPage = lazy(() => import('../pages/MythologyPage'));
const DynastiesPage = lazy(() => import('../pages/DynastiesPage'));

export const routes: RouteConfig[] = [
  {
    key: 'timeline',
    path: '/timeline',
    label: '时间轴',
    component: TimelinePage,
    index: true
  },
  {
    key: 'dynasties',
    path: '/dynasties',
    label: '历代纪元',
    component: DynastiesPage
  },
  {
    key: 'map',
    path: '/map',
    label: '地图',
    component: MapPage
  },
  {
    key: 'people',
    path: '/people',
    label: '人物',
    component: PeoplePage
  },
  {
    key: 'culture',
    path: '/culture',
    label: '文化',
    component: CulturePage
  },
  {
    key: 'mythology',
    path: '/mythology',
    label: '神话',
    component: MythologyPage
  }
];