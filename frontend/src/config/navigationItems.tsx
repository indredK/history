/**
 * 导航项工厂函数
 * 创建包含图标的导航项配置
 */

import React from 'react';
import {
  History,
  MapOutlined,
  People,
  Palette,
  AutoAwesome,
  Event,
  AccountBalance
} from '@mui/icons-material';
import { navigationItemsConfig } from './navigation';

// 导航项完整配置接口
export interface NavigationItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  description?: string;
}

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  timeline: <History />,
  dynasties: <AccountBalance />,
  map: <MapOutlined />,
  people: <People />,
  culture: <Palette />,
  mythology: <AutoAwesome />,
  events: <Event />
};

// 创建包含图标的导航项配置
export const createNavigationItems = (): NavigationItem[] => {
  return navigationItemsConfig.map(item => ({
    ...item,
    icon: iconMap[item.key] || <History />
  }));
};

// 导出导航项配置
export const navigationItems = createNavigationItems();