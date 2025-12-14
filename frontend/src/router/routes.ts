export interface RouteConfig {
  key: string;
  path: string;
  label: string;
  component: React.LazyExoticComponent<React.ComponentType> | (() => Promise<{ default: React.ComponentType }>);
}

// 动态导入页面组件
export const routes: RouteConfig[] = [
  {
    key: 'timeline',
    path: '/timeline',
    label: '时间轴',
    component: () => import('../features/events/EventList').then(m => ({ default: m.EventList }))
  },
  {
    key: 'map',
    path: '/map',
    label: '地图',
    component: () => import('../features/map/MapView').then(m => ({ default: m.MapView }))
  },
  {
    key: 'people',
    path: '/people',
    label: '人物',
    component: () => import('../features/people/PeoplePage').then(m => ({ default: m.PeoplePage }))
  },
  {
    key: 'culture',
    path: '/culture',
    label: '文化',
    component: () => import('../features/culture/CulturePage').then(m => ({ default: m.CulturePage }))
  }
];