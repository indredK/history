import type { SanguoFigureService } from './sanguoService';
import { createUnifiedService } from '../../base/serviceFactory';
import type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from './types';
import { sanguoFigureServiceHelper } from './sanguoService';
import {
  isRecord,
  readEvaluations,
  readEvents,
  readNumber,
  readOptionalString,
  readString,
  readStringArray,
} from '../common/figureTransform';

const SANGUO_ROLES: SanguoFigureRole[] = [
  'ruler',
  'strategist',
  'general',
  'advisor',
  'official',
  'other',
];
const SANGUO_KINGDOMS: SanguoKingdom[] = ['魏', '蜀', '吴', '其他'];

function normalizeSanguoRole(value: string): SanguoFigureRole {
  return SANGUO_ROLES.includes(value as SanguoFigureRole)
    ? (value as SanguoFigureRole)
    : 'other';
}

function normalizeSanguoKingdom(value: string): SanguoKingdom {
  return SANGUO_KINGDOMS.includes(value as SanguoKingdom)
    ? (value as SanguoKingdom)
    : '其他';
}

// 数据转换器
function transformJsonToSanguoFigure(jsonFigure: unknown, index: number): SanguoFigure {
  const record = isRecord(jsonFigure) ? jsonFigure : {};
  const name = readString(record, 'name', `人物${index}`);
  
  const figure: SanguoFigure = {
    id: readString(record, 'id', `sanguo_figure_${name.replace(/\s+/g, '_') || `figure${index}`}`),
    name,
    birthYear: readNumber(record, ['birthYear', 'birth_year']),
    deathYear: readNumber(record, ['deathYear', 'death_year']),
    role: normalizeSanguoRole(readString(record, 'role', 'other')),
    kingdom: normalizeSanguoKingdom(readString(record, 'kingdom', '其他')),
    positions: readStringArray(record, 'positions'),
    biography: readString(record, 'biography'),
    achievements: readStringArray(record, 'achievements'),
    events: readEvents(record),
    evaluations: readEvaluations(record),
    sources: readStringArray(record, 'sources'),
  };

  const courtesy = readOptionalString(record, 'courtesy');
  const faction = readOptionalString(record, 'faction');
  const politicalViews = readOptionalString(record, 'politicalViews');
  const portraitUrl = readOptionalString(record, 'portraitUrl');
  if (courtesy) figure.courtesy = courtesy;
  if (faction) figure.faction = faction;
  if (politicalViews) figure.politicalViews = politicalViews;
  if (portraitUrl) figure.portraitUrl = portraitUrl;
  return figure;
}

// 创建统一服务
const unifiedService = createUnifiedService<SanguoFigure>(
  '/sanguo-figures',
  '/data/json/sanguo_figures.json',
  transformJsonToSanguoFigure,
  { hasGetById: true }
);

// 实现三国人物服务
export const sanguoFigureApi: SanguoFigureService = {
  ...unifiedService,
  getSanguoFigures: () => unifiedService.getAll(),
  getSanguoFigureById: (id: string) => unifiedService.getById!(id),
  getRoleTypes: () => [],
  getKingdoms: () => [],
  
  // 数据处理方法（代理到辅助类）
  filterByRole: sanguoFigureServiceHelper.filterByRole,
  filterByKingdom: sanguoFigureServiceHelper.filterByKingdom,
  searchFigures: sanguoFigureServiceHelper.searchFigures,
  sortFigures: sanguoFigureServiceHelper.sortFigures,
  filterAndSort: sanguoFigureServiceHelper.filterAndSort,
  getRoleLabel: sanguoFigureServiceHelper.getRoleLabel,
  formatLifespan: sanguoFigureServiceHelper.formatLifespan,
  calculateAge: sanguoFigureServiceHelper.calculateAge,
};

// 保持向后兼容的导出
export const getSanguoFigures = () => sanguoFigureApi.getSanguoFigures();
export const getSanguoFigureById = (id: string) => sanguoFigureApi.getSanguoFigureById(id);
export const getRoleTypes = () => sanguoFigureApi.getRoleTypes();
export const getKingdoms = () => sanguoFigureApi.getKingdoms();

// 导出服务辅助方法（保持向后兼容）
export const sanguoFigureService = sanguoFigureServiceHelper;
