import type { SanguoFigureService } from './sanguoService';
import { createUnifiedService } from '../../base/serviceFactory';
import type { SanguoFigure } from './types';
import { sanguoFigureServiceHelper } from './sanguoService';

// 数据转换器
function transformJsonToSanguoFigure(jsonFigure: any, index: number): SanguoFigure {
  // 解析角色和阵营
  const role = jsonFigure.role || 'other';
  const kingdom = jsonFigure.kingdom || '其他';
  
  // 解析事件
  const events = jsonFigure.events || [];
  const formattedEvents = events.map((event: any, i: number) => ({
    name: event.name || `事件${i + 1}`,
    year: event.year || 0,
    role: event.role || '',
    description: event.description || ''
  }));
  
  // 解析评价
  const evaluations = jsonFigure.evaluations || [];
  const formattedEvaluations = evaluations.map((evaluation: any, i: number) => ({
    source: evaluation.source || `来源${i + 1}`,
    content: evaluation.content || '',
    author: evaluation.author
  }));
  
  // 解析成就
  const achievements = jsonFigure.achievements || [];
  const formattedAchievements = Array.isArray(achievements) ? achievements : [];
  
  // 解析职位
  const positions = jsonFigure.positions || [];
  const formattedPositions = Array.isArray(positions) ? positions : [];
  
  // 解析来源
  const sources = jsonFigure.sources || [];
  const formattedSources = Array.isArray(sources) ? sources : [];
  
  return {
    id: jsonFigure.id || `sanguo_figure_${jsonFigure.name?.replace(/\s+/g, '_') || `figure${index}`}`,
    name: jsonFigure.name || `人物${index}`,
    courtesy: jsonFigure.courtesy,
    birthYear: jsonFigure.birthYear || 0,
    deathYear: jsonFigure.deathYear || 0,
    role: role as SanguoFigure['role'],
    kingdom: kingdom as SanguoFigure['kingdom'],
    positions: formattedPositions,
    faction: jsonFigure.faction,
    biography: jsonFigure.biography || '',
    politicalViews: jsonFigure.politicalViews,
    achievements: formattedAchievements,
    events: formattedEvents,
    evaluations: formattedEvaluations,
    portraitUrl: jsonFigure.portraitUrl,
    sources: formattedSources,
  };
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

