/**
 * YuanFigure API Service
 * 元朝人物数据 API 服务
 */

import type { YuanFigure, YuanFigureRole } from './types';
import { createUnifiedService } from '../../base/serviceFactory';
import type { YuanFigureService } from './yuanService';
import { yuanFigureServiceHelper } from './yuanService';
import {
  isRecord,
  readEvaluations,
  readEvents,
  readNumber,
  readOptionalString,
  readString,
  readStringArray,
} from '../common/figureTransform';

const YUAN_ROLES: YuanFigureRole[] = [
  'emperor',
  'chancellor',
  'general',
  'official',
  'scholar',
  'other',
];

function normalizeYuanRole(value: string): YuanFigureRole {
  return YUAN_ROLES.includes(value as YuanFigureRole) ? (value as YuanFigureRole) : 'other';
}

// 数据转换函数
export function transformJsonToYuanFigure(jsonData: unknown, index: number): YuanFigure {
  const record = isRecord(jsonData) ? jsonData : {};
  const name = readString(record, 'name');
  const figure: YuanFigure = {
    id: readString(record, 'id', `yuan_figure_${name.replace(/\s+/g, '_') || `unknown_${index}`}`),
    name,
    birthYear: readNumber(record, ['birthYear', 'birth_year']),
    deathYear: readNumber(record, ['deathYear', 'death_year']),
    role: normalizeYuanRole(readString(record, 'role', 'other')),
    positions: readStringArray(record, 'positions'),
    biography: readString(record, 'biography'),
    politicalViews: readString(record, 'politicalViews'),
    achievements: readStringArray(record, 'achievements'),
    events: readEvents(record),
    evaluations: readEvaluations(record),
    sources: readStringArray(record, 'sources'),
  };
  const courtesy = readOptionalString(record, 'courtesy');
  const faction = readOptionalString(record, 'faction');
  const portraitUrl = readOptionalString(record, 'portraitUrl');
  if (courtesy) figure.courtesy = courtesy;
  if (faction) figure.faction = faction;
  if (portraitUrl) figure.portraitUrl = portraitUrl;
  return figure;
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
