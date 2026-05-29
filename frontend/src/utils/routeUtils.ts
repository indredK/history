import { routes } from '../router/routes';

// 路由工具函数
export const getRouteByPath = (path: string) => {
  return routes.find(route => route.path === path);
};

export const getActiveTabFromPath = (pathname: string): string => {
  if (pathname === '/timeline') return 'timeline';
  if (pathname === '/map') return 'map';
  if (pathname === '/people') return 'people';
  if (pathname === '/culture') return 'culture';
  return 'timeline';
};

export const getAllRoutes = () => routes;

// 验证路由配置
export const validateRoutes = () => {
  return routes.length;
};