import type { TangFigureService } from './tangService';
import { createUnifiedService } from '../../base/serviceFactory';
import type { TangFigure, TangFigureRole } from './types';
import { tangFigureServiceHelper } from './tangService';
import {
  isRecord,
  readEvaluations,
  readEvents,
  readNumber,
  readOptionalString,
  readString,
  readStringArray,
} from '../common/figureTransform';

const TANG_ROLES: TangFigureRole[] = [
  'emperor',
  'chancellor',
  'general',
  'official',
  'poet',
  'other',
];

function normalizeTangRole(roles: string[]): TangFigureRole {
  return TANG_ROLES.find((role) => role !== 'other' && roles.includes(role)) ?? 'other';
}

// 数据转换器
function transformJsonToTangFigure(jsonFigure: unknown, index: number): TangFigure {
  const record = isRecord(jsonFigure) ? jsonFigure : {};
  const roles = readStringArray(record, ['role', 'position', 'roles']);
  
  const factions = readStringArray(record, 'factions');
  const achievements = readStringArray(record, 'achievements');
  const positions = readStringArray(record, 'positions');
  const name = readString(record, 'name', `唐朝人物${index + 1}`);
  
  const figure: TangFigure = {
    id: readString(record, 'id', `tang_figure_${name.replace(/\s+/g, '_')}_${index}`),
    name,
    birthYear: readNumber(record, ['birthYear', 'birth_year']),
    deathYear: readNumber(record, ['deathYear', 'death_year']),
    biography: readString(record, 'biography'),
    role: normalizeTangRole(roles),
    positions: positions.length > 0 ? positions : roles,
    achievements: achievements,
    events: readEvents(record),
    evaluations: readEvaluations(record),
    sources: readOptionalString(record, 'source')
      ? [`src_${readString(record, 'source')}`]
      : readStringArray(record, 'sources'),
  };

  if (factions[0]) {
    figure.faction = factions[0];
  }

  return figure;
}

// 创建统一服务
const unifiedService = createUnifiedService<TangFigure>(
  '/tang-figures',
  '/data/json/tang_figures.json',
  transformJsonToTangFigure,
  { hasGetById: true }
);

// 实现唐朝人物服务
export const tangFigureApi: TangFigureService = {
  ...unifiedService,
  getTangFigures: () => unifiedService.getAll(),
  getTangFigureById: (id: string) => unifiedService.getById!(id),
  getRoleTypes: () => [],
  getFactions: () => [],
  
  // 数据处理方法（代理到辅助类）
  filterByRole: tangFigureServiceHelper.filterByRole,
  filterByPeriod: tangFigureServiceHelper.filterByPeriod,
  filterByFaction: tangFigureServiceHelper.filterByFaction,
  searchFigures: tangFigureServiceHelper.searchFigures,
  sortFigures: tangFigureServiceHelper.sortFigures,
  filterAndSort: tangFigureServiceHelper.filterAndSort,
  getRoleLabel: tangFigureServiceHelper.getRoleLabel,
  formatLifespan: tangFigureServiceHelper.formatLifespan,
  calculateAge: tangFigureServiceHelper.calculateAge,
};

// 保持向后兼容的导出
export const getTangFigures = () => tangFigureApi.getTangFigures();
export const getTangFigureById = (id: string) => tangFigureApi.getTangFigureById(id);
export const getRoleTypes = () => tangFigureApi.getRoleTypes();
export const getFactions = () => tangFigureApi.getFactions();

// 导出服务辅助方法（保持向后兼容）
export const tangFigureService = tangFigureServiceHelper;
