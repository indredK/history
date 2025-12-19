/**
 * 导航配置文件
 * 统一管理导航菜单的配置信息
 */

import { navigationThemes } from './theme';

// 导航项基础配置接口
export interface NavigationItemConfig {
  key: string;
  label: string;
  path: string;
  description?: string;
}

// 导航菜单基础配置
export const navigationItemsConfig: NavigationItemConfig[] = [
  {
    key: 'timeline',
    label: '时间轴',
    path: '/timeline',
    description: '按时间顺序浏览历史事件'
  },
  {
    key: 'dynasties',
    label: '历代纪元',
    path: '/dynasties',
    description: '中国历代王朝纪元表'
  },
  {
    key: 'map',
    label: '地图',
    path: '/map',
    description: '历史地图和地理信息'
  },
  {
    key: 'people',
    label: '人物',
    path: '/people',
    description: '历史人物传记'
  },
  {
    key: 'culture',
    label: '文化',
    path: '/culture',
    description: '文化艺术和传统'
  },
  {
    key: 'mythology',
    label: '神话',
    path: '/mythology',
    description: '神话传说和民间故事'
  },
  {
    key: 'events',
    label: '重大事件',
    path: '/events',
    description: '重要历史事件'
  }
];

// 获取导航项配置
export const getNavigationItem = (key: string): NavigationItemConfig | undefined => {
  return navigationItemsConfig.find(item => item.key === key);
};

// 获取导航项的主题配置
export const getNavigationItemTheme = (key: string) => {
  return navigationThemes[key] ?? navigationThemes.timeline;
};

// 导航样式配置
export const navigationStyles = {
  // 按钮基础样式
  button: {
    borderRadius: 'var(--radius-lg)',
    transition: 'all var(--transition-normal)',
    fontWeight: 500
  },
  
  // 活跃状态样式
  activeButton: {
    boxShadow: 'var(--shadow-md), var(--shadow-glow)',
    color: 'white'
  },
  
  // 非活跃状态样式
  inactiveButton: {
    background: 'transparent',
    boxShadow: 'var(--shadow-sm)'
  },
  
  // 悬停效果样式
  hoverEffect: {
    boxShadow: 'var(--shadow-md), var(--shadow-glow)',
    transform: 'translateY(-2px)'
  },
  
  // 图标按钮样式（收起状态）
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 'var(--radius-lg)',
    transition: 'all var(--transition-normal)'
  },
  
  // 图标按钮悬停样式
  iconButtonHover: {
    boxShadow: 'var(--shadow-md), var(--shadow-glow)',
    transform: 'translateY(-2px)'
  }
};

export default {
  navigationItemsConfig,
  getNavigationItem,
  getNavigationItemTheme,
  navigationStyles
};