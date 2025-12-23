/**
 * 三国人物数据服务
 * Three Kingdoms Figure Data Service
 */

import type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from './types';
import { ROLE_LABELS } from './types';
import { getSanguoFigures, getSanguoFigureById, getRoleTypes, getKingdoms } from './sanguoFigureDataClient';

export type SanguoFigureSortBy = 'birthYear' | 'name' | 'role' | 'kingdom';

export const sanguoFigureService = {
  getSanguoFigures,
  getSanguoFigureById,
  getRoleTypes,
  getKingdoms,

  filterByRole(figures: SanguoFigure[], role: SanguoFigureRole | '全部'): SanguoFigure[] {
    if (role === '全部' || !role) return figures;
    return figures.filter(f => f.role === role);
  },

  filterByKingdom(figures: SanguoFigure[], kingdom: SanguoKingdom | '全部'): SanguoFigure[] {
    if (kingdom === '全部' || !kingdom) return figures;
    return figures.filter(f => f.kingdom === kingdom);
  },

  searchFigures(figures: SanguoFigure[], query: string): SanguoFigure[] {
    if (!query || query.trim() === '') return figures;
    const lowerQuery = query.toLowerCase().trim();
    return figures.filter(figure => {
      if (figure.name.toLowerCase().includes(lowerQuery)) return true;
      if (figure.courtesy?.toLowerCase().includes(lowerQuery)) return true;
      if (figure.positions.some(p => p.toLowerCase().includes(lowerQuery))) return true;
      if (figure.kingdom.includes(lowerQuery)) return true;
      return false;
    });
  },

  sortFigures(figures: SanguoFigure[], sortBy: SanguoFigureSortBy): SanguoFigure[] {
    const sorted = [...figures];
    switch (sortBy) {
      case 'birthYear':
        return sorted.sort((a, b) => a.birthYear - b.birthYear);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      case 'role':
        const roleOrder: Record<SanguoFigureRole, number> = {
          ruler: 1, strategist: 2, general: 3, official: 4, other: 5
        };
        return sorted.sort((a, b) => {
          const orderDiff = roleOrder[a.role] - roleOrder[b.role];
          if (orderDiff !== 0) return orderDiff;
          return a.birthYear - b.birthYear;
        });
      case 'kingdom':
        const kingdomOrder: Record<SanguoKingdom, number> = {
          '魏': 1, '蜀': 2, '吴': 3, '其他': 4
        };
        return sorted.sort((a, b) => {
          const orderDiff = kingdomOrder[a.kingdom] - kingdomOrder[b.kingdom];
          if (orderDiff !== 0) return orderDiff;
          return a.birthYear - b.birthYear;
        });
      default:
        return sorted;
    }
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
    if (options.role) result = this.filterByRole(result, options.role);
    if (options.kingdom) result = this.filterByKingdom(result, options.kingdom);
    if (options.query) result = this.searchFigures(result, options.query);
    if (options.sortBy) result = this.sortFigures(result, options.sortBy);
    return result;
  },

  getRoleLabel(role: SanguoFigureRole): string {
    return ROLE_LABELS[role] || '其他';
  },

  formatLifespan(figure: SanguoFigure): string {
    return `${figure.birthYear}年 - ${figure.deathYear}年`;
  },

  calculateAge(figure: SanguoFigure): number {
    return figure.deathYear - figure.birthYear;
  }
};

export default sanguoFigureService;
