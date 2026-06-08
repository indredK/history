/**
 * 三国人物数据服务
 * Three Kingdoms Figure Data Service
 */

import type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from './types';
import { ROLE_LABELS } from './types';
import type { BaseService } from '../../base/types';
import { createFigureServiceHelper } from '../createFigureServiceHelper';

export type SanguoFigureSortBy = 'birthYear' | 'name' | 'role' | 'kingdom';

export interface SanguoFigureService extends BaseService<SanguoFigure> {
  getSanguoFigures(): Promise<{ data: SanguoFigure[] }>;
  getSanguoFigureById(id: string): Promise<{ data: SanguoFigure | null }>;
  getRoleTypes(): string[];
  getKingdoms(): string[];

  // 数据处理方法
  filterByRole(figures: SanguoFigure[], role: SanguoFigureRole | '全部'): SanguoFigure[];
  filterByKingdom(figures: SanguoFigure[], kingdom: SanguoKingdom | '全部'): SanguoFigure[];
  searchFigures(figures: SanguoFigure[], query: string): SanguoFigure[];
  sortFigures(figures: SanguoFigure[], sortBy: SanguoFigureSortBy): SanguoFigure[];
  filterAndSort(
    figures: SanguoFigure[],
    options: {
      role?: SanguoFigureRole | '全部';
      kingdom?: SanguoKingdom | '全部';
      query?: string;
      sortBy?: SanguoFigureSortBy;
    }
  ): SanguoFigure[];
  getRoleLabel(role: SanguoFigureRole): string;
  formatLifespan(figure: SanguoFigure): string;
  calculateAge(figure: SanguoFigure): number;
}

// 使用工厂创建三国人物服务的辅助方法
const baseHelper = createFigureServiceHelper<SanguoFigure, SanguoFigureRole, SanguoFigureSortBy>({
  roleLabels: ROLE_LABELS,
  getPeriod: () => '三国', // 三国不使用时期筛选
  roleOrder: {
    ruler: 1, strategist: 2, general: 3, advisor: 4, official: 5, other: 6,
  },
  extraSearchFields: [
    (figure) => figure.kingdom,
  ],
  extraSortStrategies: {
    kingdom: (a, b) => {
      const kingdomOrder: Record<SanguoKingdom, number> = {
        '魏': 1, '蜀': 2, '吴': 3, '其他': 4,
      };
      const orderDiff = kingdomOrder[a.kingdom] - kingdomOrder[b.kingdom];
      if (orderDiff !== 0) return orderDiff;
      return a.birthYear - b.birthYear;
    },
  },
});

// 实现三国人物服务的辅助方法（扩展工厂方法）
export const sanguoFigureServiceHelper = {
  ...baseHelper,

  filterByKingdom(figures: SanguoFigure[], kingdom: SanguoKingdom | '全部'): SanguoFigure[] {
    if (kingdom === '全部' || !kingdom) return figures;
    return figures.filter(f => f.kingdom === kingdom);
  },

  filterAndSort(
    figures: SanguoFigure[],
    options: {
      role?: SanguoFigureRole | '全部';
      kingdom?: SanguoKingdom | '全部';
      query?: string;
      sortBy?: SanguoFigureSortBy;
    }
  ): SanguoFigure[] {
    let result = figures;
    if (options.role) result = baseHelper.filterByRole(result, options.role);
    if (options.kingdom) result = this.filterByKingdom(result, options.kingdom);
    if (options.query) result = baseHelper.searchFigures(result, options.query);
    if (options.sortBy) result = baseHelper.sortFigures(result, options.sortBy);
    return result;
  },
};
