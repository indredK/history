import type { TangFigureService } from './tangFigureService';
import { createUnifiedService } from '../../base/serviceFactory';
import type { TangFigure } from './types';
import { tangFigureServiceHelper } from './tangFigureService';

// 数据转换器
function transformJsonToTangFigure(jsonFigure: any, index: number): TangFigure {
  // 处理角色：优先使用position字段（mock数据），如果没有则使用roles字符串
  const rawRoles = jsonFigure.position || jsonFigure.roles;
  const roles = Array.isArray(rawRoles) ? rawRoles : 
               rawRoles ? rawRoles.split(',').map((r: string) => r.trim()) : [];
  
  // 处理派系：如果是数组直接使用，否则分割字符串
  const factions = Array.isArray(jsonFigure.factions) ? jsonFigure.factions : 
                  jsonFigure.factions ? jsonFigure.factions.split(',').map((f: string) => f.trim()) : [];
  
  // 处理成就：如果是数组直接使用，否则分割字符串
  const achievements = Array.isArray(jsonFigure.achievements) ? jsonFigure.achievements : 
                      jsonFigure.achievements ? jsonFigure.achievements.split('|').map((a: string) => a.trim()) : [];
  
  // 处理职位：优先使用positions字段（mock数据），如果没有则使用角色
  const positions = jsonFigure.positions || roles;
  
  return {
    id: `tang_figure_${jsonFigure.name.replace(/\s+/g, '_')}_${index}`,
    name: jsonFigure.name,
    birthYear: jsonFigure.birthYear || jsonFigure.birth_year || 0,
    deathYear: jsonFigure.deathYear || jsonFigure.death_year || 0,
    biography: jsonFigure.biography || '',
    role: roles.includes('emperor') ? 'emperor' : roles.includes('chancellor') ? 'chancellor' : 
          roles.includes('general') ? 'general' : roles.includes('official') ? 'official' : 
          roles.includes('poet') ? 'poet' : 'other',
    positions: positions,
    faction: factions[0] || undefined,
    achievements: achievements,
    events: jsonFigure.events || [],
    evaluations: jsonFigure.evaluations || [],
    sources: jsonFigure.source ? [`src_${jsonFigure.source}`] : jsonFigure.sources || [],
  };
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

