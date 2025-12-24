/**
 * 元朝人物数据服务
 * Yuan Dynasty Figure Data Service
 */

import type { YuanFigure, YuanFigureRole } from './types';
import { ROLE_LABELS, getYuanPeriod } from './types';
import type { BaseService } from '../../base/serviceFactory';

export type YuanFigureSortBy = 'birthYear' | 'name' | 'role';

export interface YuanFigureService extends BaseService<YuanFigure> {
  filterByRole(figures: YuanFigure[], role: YuanFigureRole | '全部'): YuanFigure[];
  filterByPeriod(figures: YuanFigure[], period: string): YuanFigure[];
  filterByFaction(figures: YuanFigure[], faction: string): YuanFigure[];
  searchFigures(figures: YuanFigure[], query: string): YuanFigure[];
  sortFigures(figures: YuanFigure[], sortBy: YuanFigureSortBy): YuanFigure[];
  filterAndSort(
    figures: YuanFigure[],
    options: {
      role?: YuanFigureRole | '全部';
      period?: string;
      faction?: string;
      query?: string;
      sortBy?: YuanFigureSortBy;
    }
  ): YuanFigure[];
  getRoleLabel(role: YuanFigureRole): string;
  formatLifespan(figure: YuanFigure): string;
  calculateAge(figure: YuanFigure): number;
}

export const yuanFigureServiceHelper: YuanFigureService = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: () => Promise.resolve({ data: null }),


  filterByRole(figures: YuanFigure[], role: YuanFigureRole | '全部'): YuanFigure[] {
    if (role === '全部' || !role) return figures;
    return figures.filter(f => f.role === role);
  },

  filterByPeriod(figures: YuanFigure[], period: string): YuanFigure[] {
    if (period === '全部' || !period) return figures;
    return figures.filter(f => getYuanPeriod(f.birthYear) === period);
  },

  filterByFaction(figures: YuanFigure[], faction: string): YuanFigure[] {
    if (faction === '全部' || !faction) return figures;
    return figures.filter(f => f.faction === faction);
  },

  searchFigures(figures: YuanFigure[], query: string): YuanFigure[] {
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

  sortFigures(figures: YuanFigure[], sortBy: YuanFigureSortBy): YuanFigure[] {
    const sorted = [...figures];
    switch (sortBy) {
      case 'birthYear':
        return sorted.sort((a, b) => a.birthYear - b.birthYear);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      case 'role': {
        const roleOrder: Record<YuanFigureRole, number> = {
          emperor: 1, chancellor: 2, general: 3, official: 4, scholar: 5, other: 6
        };
        return sorted.sort((a, b) => {
          const orderDiff = roleOrder[a.role] - roleOrder[b.role];
          if (orderDiff !== 0) return orderDiff;
          return a.birthYear - b.birthYear;
        });
      }
      default:
        return sorted;
    }
  },

  filterAndSort(
    figures: YuanFigure[],
    options: {
      role?: YuanFigureRole | '全部';
      period?: string;
      faction?: string;
      query?: string;
      sortBy?: YuanFigureSortBy;
    }
  ): YuanFigure[] {
    let result = figures;
    if (options.role) result = this.filterByRole(result, options.role);
    if (options.period) result = this.filterByPeriod(result, options.period);
    if (options.faction) result = this.filterByFaction(result, options.faction);
    if (options.query) result = this.searchFigures(result, options.query);
    if (options.sortBy) result = this.sortFigures(result, options.sortBy);
    return result;
  },

  getRoleLabel(role: YuanFigureRole): string {
    return ROLE_LABELS[role] || '其他';
  },

  formatLifespan(figure: YuanFigure): string {
    return `${figure.birthYear}年 - ${figure.deathYear}年`;
  },

  calculateAge(figure: YuanFigure): number {
    return figure.deathYear - figure.birthYear;
  }
};
