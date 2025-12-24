/**
 * 宋朝人物数据服务
 * Song Dynasty Figure Data Service
 */

import type { SongFigure, SongFigureRole } from './types';
import { ROLE_LABELS, getSongPeriod } from './types';
import type { BaseService } from '../../base/serviceFactory';

export type SongFigureSortBy = 'birthYear' | 'name' | 'role';

export interface SongFigureService extends BaseService<SongFigure> {
  filterByRole(figures: SongFigure[], role: SongFigureRole | '全部'): SongFigure[];
  filterByPeriod(figures: SongFigure[], period: string): SongFigure[];
  filterByFaction(figures: SongFigure[], faction: string): SongFigure[];
  searchFigures(figures: SongFigure[], query: string): SongFigure[];
  sortFigures(figures: SongFigure[], sortBy: SongFigureSortBy): SongFigure[];
  filterAndSort(
    figures: SongFigure[],
    options: {
      role?: SongFigureRole | '全部';
      period?: string;
      faction?: string;
      query?: string;
      sortBy?: SongFigureSortBy;
    }
  ): SongFigure[];
  getRoleLabel(role: SongFigureRole): string;
  formatLifespan(figure: SongFigure): string;
  calculateAge(figure: SongFigure): number;
}

export const songFigureServiceHelper: SongFigureService = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: () => Promise.resolve({ data: null }),


  filterByRole(figures: SongFigure[], role: SongFigureRole | '全部'): SongFigure[] {
    if (role === '全部' || !role) return figures;
    return figures.filter(f => f.role === role);
  },

  filterByPeriod(figures: SongFigure[], period: string): SongFigure[] {
    if (period === '全部' || !period) return figures;
    return figures.filter(f => getSongPeriod(f.birthYear) === period);
  },

  filterByFaction(figures: SongFigure[], faction: string): SongFigure[] {
    if (faction === '全部' || !faction) return figures;
    return figures.filter(f => f.faction === faction);
  },

  searchFigures(figures: SongFigure[], query: string): SongFigure[] {
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

  sortFigures(figures: SongFigure[], sortBy: SongFigureSortBy): SongFigure[] {
    const sorted = [...figures];
    switch (sortBy) {
      case 'birthYear':
        return sorted.sort((a, b) => a.birthYear - b.birthYear);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      case 'role': {
        const roleOrder: Record<SongFigureRole, number> = {
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
    figures: SongFigure[],
    options: {
      role?: SongFigureRole | '全部';
      period?: string;
      faction?: string;
      query?: string;
      sortBy?: SongFigureSortBy;
    }
  ): SongFigure[] {
    let result = figures;
    if (options.role) result = this.filterByRole(result, options.role);
    if (options.period) result = this.filterByPeriod(result, options.period);
    if (options.faction) result = this.filterByFaction(result, options.faction);
    if (options.query) result = this.searchFigures(result, options.query);
    if (options.sortBy) result = this.sortFigures(result, options.sortBy);
    return result;
  },

  getRoleLabel(role: SongFigureRole): string {
    return ROLE_LABELS[role] || '其他';
  },

  formatLifespan(figure: SongFigure): string {
    return `${figure.birthYear}年 - ${figure.deathYear}年`;
  },

  calculateAge(figure: SongFigure): number {
    return figure.deathYear - figure.birthYear;
  }
};
