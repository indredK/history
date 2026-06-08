/**
 * 宋朝人物API服务
 * Song Dynasty Figure API Service
 */

import type { SongFigure, SongFigureRole } from './types';
import { createUnifiedService } from '../../base/serviceFactory';
import type { SongFigureService } from './songService';
import { songFigureServiceHelper } from './songService';
import {
  isRecord,
  readEvaluations,
  readEvents,
  readNumber,
  readOptionalString,
  readString,
  readStringArray,
} from '../common/figureTransform';

const SONG_ROLES: SongFigureRole[] = [
  'emperor',
  'chancellor',
  'general',
  'official',
  'scholar',
  'other',
];

function normalizeSongRole(value: string): SongFigureRole {
  return SONG_ROLES.includes(value as SongFigureRole) ? (value as SongFigureRole) : 'other';
}

/**
 * 数据转换函数
 */
const transformJsonToSongFigure = (jsonData: unknown, index: number): SongFigure => {
  const record = isRecord(jsonData) ? jsonData : {};
  const name = readString(record, 'name');
  const figure: SongFigure = {
    id: readString(record, 'id', `song_figure_${name.replace(/\s+/g, '_') || `unknown_${index}`}`),
    name,
    birthYear: readNumber(record, ['birthYear', 'birth_year']),
    deathYear: readNumber(record, ['deathYear', 'death_year']),
    role: normalizeSongRole(readString(record, 'role', 'other')),
    positions: readStringArray(record, 'positions'),
    biography: readString(record, 'biography'),
    politicalViews: readString(record, ['politicalViews', 'political_views']),
    achievements: readStringArray(record, 'achievements'),
    events: readEvents(record),
    evaluations: readEvaluations(record),
    sources: readStringArray(record, 'sources'),
  };
  const courtesy = readOptionalString(record, 'courtesy');
  const faction = readOptionalString(record, 'faction');
  if (courtesy) figure.courtesy = courtesy;
  if (faction) figure.faction = faction;
  return figure;
};

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
