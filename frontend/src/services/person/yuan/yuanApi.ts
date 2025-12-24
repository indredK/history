/**
 * YuanFigure API Service
 * 元朝人物数据 API 服务
 */

import type { YuanFigure } from './types';
import { createUnifiedService } from '../../base/serviceFactory';
import type { YuanFigureService } from './yuanService';
import { yuanFigureServiceHelper } from './yuanService';

// 数据转换函数
export function transformJsonToYuanFigure(jsonData: any, index: number): YuanFigure {
  return {
    id: jsonData.id || `yuan_figure_${jsonData.name?.replace(/\s+/g, '_') || `unknown_${index}`}`,
    name: jsonData.name || '',
    courtesy: jsonData.courtesy,
    birthYear: jsonData.birthYear || 0,
    deathYear: jsonData.deathYear || 0,
    role: jsonData.role || 'other',
    positions: jsonData.positions || [],
    faction: jsonData.faction,
    biography: jsonData.biography || '',
    politicalViews: jsonData.politicalViews || '',
    achievements: jsonData.achievements || [],
    events: jsonData.events || [],
    evaluations: jsonData.evaluations || [],
    portraitUrl: jsonData.portraitUrl,
    sources: jsonData.sources || []
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<YuanFigure>(
  '/yuan-figures',
  '/data/json/yuan_figures.json',
  transformJsonToYuanFigure,
  {
    hasGetById: true
  }
);

/**
 * 实现元朝人物服务
 */
export const yuanFigureService: YuanFigureService = {
  ...unifiedService,
  getAll: () => unifiedService.getAll(),
  getById: (id: string) => unifiedService.getById!(id),
  
  // 数据处理方法（代理到辅助类）
  filterByRole: yuanFigureServiceHelper.filterByRole,
  filterByPeriod: yuanFigureServiceHelper.filterByPeriod,
  filterByFaction: yuanFigureServiceHelper.filterByFaction,
  searchFigures: yuanFigureServiceHelper.searchFigures,
  sortFigures: yuanFigureServiceHelper.sortFigures,
  filterAndSort: yuanFigureServiceHelper.filterAndSort,
  getRoleLabel: yuanFigureServiceHelper.getRoleLabel,
  formatLifespan: yuanFigureServiceHelper.formatLifespan,
  calculateAge: yuanFigureServiceHelper.calculateAge
};

// 保持向后兼容的导出
export const getYuanFigures = () => yuanFigureService.getAll();
export const getYuanFigureById = (id: string) => yuanFigureService.getById!(id);

