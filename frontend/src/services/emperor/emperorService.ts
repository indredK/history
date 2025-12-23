/**
 * 帝王数据服务
 * Emperor Data Service
 * 
 * 提供帝王数据的获取、筛选、排序功能
 * 
 * Requirements: 2.7, 2.8, 2.9
 */

import type { Emperor } from './types';
import { getDynastyOrder } from './types';
import { getEmperors, getEmperorById, getDynasties } from './emperorMock';

export type EmperorSortBy = 'reignStart' | 'dynasty';

/**
 * 帝王服务类
 */
export const emperorService = {
  /**
   * 获取所有帝王数据
   */
  getEmperors,

  /**
   * 根据ID获取帝王
   */
  getEmperorById,

  /**
   * 获取所有朝代列表
   */
  getDynasties,

  /**
   * 按朝代筛选帝王
   * Requirements: 2.8
   */
  filterByDynasty(emperors: Emperor[], dynasty: string): Emperor[] {
    if (dynasty === '全部' || !dynasty) {
      return emperors;
    }
    return emperors.filter(e => e.dynasty === dynasty);
  },

  /**
   * 按关键词搜索帝王（姓名或年号）
   * Requirements: 2.7
   */
  searchEmperors(emperors: Emperor[], query: string): Emperor[] {
    if (!query || query.trim() === '') {
      return emperors;
    }
    const lowerQuery = query.toLowerCase().trim();
    return emperors.filter(emperor => {
      // 搜索姓名
      if (emperor.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索庙号
      if (emperor.templeName?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索谥号
      if (emperor.posthumousName?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索年号
      if (emperor.eraNames.some(era => era.name.toLowerCase().includes(lowerQuery))) {
        return true;
      }
      // 搜索朝代
      if (emperor.dynasty.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      return false;
    });
  },

  /**
   * 排序帝王
   * Requirements: 2.9
   */
  sortEmperors(emperors: Emperor[], sortBy: EmperorSortBy): Emperor[] {
    const sorted = [...emperors];
    switch (sortBy) {
      case 'reignStart':
        return sorted.sort((a, b) => a.reignStart - b.reignStart);
      case 'dynasty':
        return sorted.sort((a, b) => {
          const orderDiff = getDynastyOrder(a.dynasty) - getDynastyOrder(b.dynasty);
          if (orderDiff !== 0) return orderDiff;
          return a.reignStart - b.reignStart;
        });
      default:
        return sorted;
    }
  },

  /**
   * 综合筛选、搜索、排序
   */
  filterAndSort(
    emperors: Emperor[],
    options: {
      dynasty?: string;
      query?: string;
      sortBy?: EmperorSortBy;
    }
  ): Emperor[] {
    let result = emperors;

    // 按朝代筛选
    if (options.dynasty) {
      result = this.filterByDynasty(result, options.dynasty);
    }

    // 按关键词搜索
    if (options.query) {
      result = this.searchEmperors(result, options.query);
    }

    // 排序
    if (options.sortBy) {
      result = this.sortEmperors(result, options.sortBy);
    }

    return result;
  },

  /**
   * 格式化在位时间
   */
  formatReignPeriod(emperor: Emperor): string {
    const formatYear = (year: number) => {
      if (year < 0) {
        return `公元前${Math.abs(year)}年`;
      }
      return `${year}年`;
    };
    return `${formatYear(emperor.reignStart)} - ${formatYear(emperor.reignEnd)}`;
  },

  /**
   * 格式化年号列表
   */
  formatEraNames(emperor: Emperor): string {
    if (emperor.eraNames.length === 0) {
      return '无年号';
    }
    return emperor.eraNames.map(era => era.name).join('、');
  },

  /**
   * 计算在位年数
   */
  calculateReignYears(emperor: Emperor): number {
    return emperor.reignEnd - emperor.reignStart;
  }
};

export default emperorService;
