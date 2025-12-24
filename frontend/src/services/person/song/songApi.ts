/**
 * 宋朝人物API服务
 * Song Dynasty Figure API Service
 */

import type { SongFigure } from './types';
import { createUnifiedService } from '../../base/serviceFactory';
import type { SongFigureService } from './songService';
import { songFigureServiceHelper } from './songService';

/**
 * 数据转换函数
 */
const transformJsonToSongFigure = (jsonData: any, index: number): SongFigure => ({
  id: jsonData.id || `song_figure_${jsonData.name?.replace(/\s+/g, '_') || `unknown_${index}`}`,
  name: jsonData.name || '',
  birthYear: jsonData.birthYear ?? jsonData.birth_year ?? 0,
  deathYear: jsonData.deathYear ?? jsonData.death_year ?? 0,
  role: jsonData.role || 'other',
  positions: jsonData.positions || [],
  biography: jsonData.biography || '',
  politicalViews: jsonData.politicalViews || jsonData.political_views || '',
  achievements: jsonData.achievements || [],
  events: jsonData.events || [],
  evaluations: jsonData.evaluations || [],
  sources: jsonData.sources || [],
  courtesy: jsonData.courtesy,
  faction: jsonData.faction
});

/**
 * 创建统一服务
 */
const unifiedService = createUnifiedService<SongFigure>(
  '/song-figures',
  '/data/json/song_figures.json',
  transformJsonToSongFigure,
  {
    hasGetById: true
  }
);

/**
 * 实现宋朝人物服务
 */
export const songFigureService: SongFigureService = {
  ...unifiedService,
  getAll: () => unifiedService.getAll(),
  getById: (id: string) => unifiedService.getById!(id),
  
  // 数据处理方法（代理到辅助类）
  filterByRole: songFigureServiceHelper.filterByRole,
  filterByPeriod: songFigureServiceHelper.filterByPeriod,
  filterByFaction: songFigureServiceHelper.filterByFaction,
  searchFigures: songFigureServiceHelper.searchFigures,
  sortFigures: songFigureServiceHelper.sortFigures,
  filterAndSort: songFigureServiceHelper.filterAndSort,
  getRoleLabel: songFigureServiceHelper.getRoleLabel,
  formatLifespan: songFigureServiceHelper.formatLifespan,
  calculateAge: songFigureServiceHelper.calculateAge
};

// 保持向后兼容的导出
export const getSongFigures = () => songFigureService.getAll();
export const getSongFigureById = (id: string) => songFigureService.getById!(id);

