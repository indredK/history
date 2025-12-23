/**
 * 明朝人物数据服务
 * Ming Dynasty Figure Data Service
 * 
 * 提供明朝人物数据的获取、筛选、排序功能
 * 
 * Requirements: 3.7, 3.8, 3.9
 */

import type { MingFigure, MingFigureRole } from './types';
import { ROLE_LABELS, getMingPeriod } from './types';
import { getMingFigures, getMingFigureById, getRoleTypes, getFactions } from './mingFigureDataClient';

export type MingFigureSortBy = 'birthYear' | 'name' | 'role';

/**
 * 明朝人物服务类
 */
export const mingFigureService = {
  /**
   * 获取所有明朝人物数据
   */
  getMingFigures,

  /**
   * 根据ID获取明朝人物
   */
  getMingFigureById,

  /**
   * 获取所有角色类型
   */
  getRoleTypes,

  /**
   * 获取所有派系
   */
  getFactions,

  /**
   * 按角色类型筛选
   * Requirements: 3.8
   */
  filterByRole(figures: MingFigure[], role: MingFigureRole | '全部'): MingFigure[] {
    if (role === '全部' || !role) {
      return figures;
    }
    return figures.filter(f => f.role === role);
  },

  /**
   * 按时期筛选
   * Requirements: 3.8
   */
  filterByPeriod(figures: MingFigure[], period: string): MingFigure[] {
    if (period === '全部' || !period) {
      return figures;
    }
    return figures.filter(f => getMingPeriod(f.birthYear) === period);
  },

  /**
   * 按派系筛选
   */
  filterByFaction(figures: MingFigure[], faction: string): MingFigure[] {
    if (faction === '全部' || !faction) {
      return figures;
    }
    return figures.filter(f => f.faction === faction);
  },

  /**
   * 按关键词搜索
   * Requirements: 3.7
   */
  searchFigures(figures: MingFigure[], query: string): MingFigure[] {
    if (!query || query.trim() === '') {
      return figures;
    }
    const lowerQuery = query.toLowerCase().trim();
    return figures.filter(figure => {
      // 搜索姓名
      if (figure.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索字
      if (figure.courtesy?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索职位
      if (figure.positions.some(p => p.toLowerCase().includes(lowerQuery))) {
        return true;
      }
      // 搜索派系
      if (figure.faction?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      return false;
    });
  },

  /**
   * 排序
   * Requirements: 3.9
   */
  sortFigures(figures: MingFigure[], sortBy: MingFigureSortBy): MingFigure[] {
    const sorted = [...figures];
    switch (sortBy) {
      case 'birthYear':
        return sorted.sort((a, b) => a.birthYear - b.birthYear);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      case 'role':
        const roleOrder: Record<MingFigureRole, number> = {
          emperor: 1,
          cabinet: 2,
          general: 3,
          official: 4,
          eunuch: 5,
          other: 6
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

  /**
   * 综合筛选、搜索、排序
   */
  filterAndSort(
    figures: MingFigure[],
    options: {
      role?: MingFigureRole | '全部';
      period?: string;
      faction?: string;
      query?: string;
      sortBy?: MingFigureSortBy;
    }
  ): MingFigure[] {
    let result = figures;

    // 按角色筛选
    if (options.role) {
      result = this.filterByRole(result, options.role);
    }

    // 按时期筛选
    if (options.period) {
      result = this.filterByPeriod(result, options.period);
    }

    // 按派系筛选
    if (options.faction) {
      result = this.filterByFaction(result, options.faction);
    }

    // 按关键词搜索
    if (options.query) {
      result = this.searchFigures(result, options.query);
    }

    // 排序
    if (options.sortBy) {
      result = this.sortFigures(result, options.sortBy);
    }

    return result;
  },

  /**
   * 获取角色中文名称
   */
  getRoleLabel(role: MingFigureRole): string {
    return ROLE_LABELS[role] || '其他';
  },

  /**
   * 格式化生卒年
   */
  formatLifespan(figure: MingFigure): string {
    return `${figure.birthYear}年 - ${figure.deathYear}年`;
  },

  /**
   * 计算寿命
   */
  calculateAge(figure: MingFigure): number {
    return figure.deathYear - figure.birthYear;
  }
};

export default mingFigureService;
