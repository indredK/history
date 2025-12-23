/**
 * 唐朝人物数据服务
 * Tang Dynasty Figure Data Service
 */

import type { TangFigure, TangFigureRole } from './types';
import { ROLE_LABELS, getTangPeriod } from './types';
import { getTangFigures, getTangFigureById, getRoleTypes, getFactions } from './tangFigureMock';

export type TangFigureSortBy = 'birthYear' | 'name' | 'role';

export const tangFigureService = {
  getTangFigures,
  getTangFigureById,
  getRoleTypes,
  getFactions,

  filterByRole(figures: TangFigure[], role: TangFigureRole | '全部'): TangFigure[] {
    if (role === '全部' || !role) return figures;
    return figures.filter(f => f.role === role);
  },

  filterByPeriod(figures: TangFigure[], period: string): TangFigure[] {
    if (period === '全部' || !period) return figures;
    return figures.filter(f => getTangPeriod(f.birthYear) === period);
  },

  filterByFaction(figures: TangFigure[], faction: string): TangFigure[] {
    if (faction === '全部' || !faction) return figures;
    return figures.filter(f => f.faction === faction);
  },

  searchFigures(figures: TangFigure[], query: string): TangFigure[] {
    if (!query || query.trim() === '') return figures;
    const lowerQuery = query.toLowerCase().trim();
    return figures.filter(figure => {
      if (figure.name.toLowerCase().includes(lowerQuery)) return true;
      if (figure.courtesy?.toLowerCase().includes(lowerQuery)) return true;
      if (figure.positions.some(p => p.toLowerCase().includes(lowerQuery))) return true;
      if (figure.faction?.toLowerCase().includes(lowerQuery)) return true;
      return false;
    });
  },

  sortFigures(figures: TangFigure[], sortBy: TangFigureSortBy): TangFigure[] {
    const sorted = [...figures];
    switch (sortBy) {
      case 'birthYear':
        return sorted.sort((a, b) => a.birthYear - b.birthYear);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      case 'role':
        const roleOrder: Record<TangFigureRole, number> = {
          emperor: 1, chancellor: 2, general: 3, official: 4, poet: 5, other: 6
        };
        return sorted.sort((a, b) => {
          const orderDiff = roleOrder[a.role] - roleOrder[b.role];
          if (orderDiff !== 0) return orderDiff;
          return a.birthYear - b.birthYear;
        });
      default:
        return sorted;
    }
  },

  filterAndSort(
    figures: TangFigure[],
    options: {
      role?: TangFigureRole | '全部';
      period?: string;
      faction?: string;
      query?: string;
      sortBy?: TangFigureSortBy;
    }
  ): TangFigure[] {
    let result = figures;
    if (options.role) result = this.filterByRole(result, options.role);
    if (options.period) result = this.filterByPeriod(result, options.period);
    if (options.faction) result = this.filterByFaction(result, options.faction);
    if (options.query) result = this.searchFigures(result, options.query);
    if (options.sortBy) result = this.sortFigures(result, options.sortBy);
    return result;
  },

  getRoleLabel(role: TangFigureRole): string {
    return ROLE_LABELS[role] || '其他';
  },

  formatLifespan(figure: TangFigure): string {
    return `${figure.birthYear}年 - ${figure.deathYear}年`;
  },

  calculateAge(figure: TangFigure): number {
    return figure.deathYear - figure.birthYear;
  }
};

export default tangFigureService;
