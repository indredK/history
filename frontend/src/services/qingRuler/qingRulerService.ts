/**
 * 清朝统治者数据服务
 * Qing Dynasty Ruler Data Service
 * 
 * 提供清朝统治者数据的获取、筛选、排序功能
 * 
 * Requirements: 4.7, 4.8
 */

import type { QingRuler } from './types';
import { getQingPeriod } from './types';
import { getQingRulers, getQingRulerById } from './qingRulerDataClient';

export type QingRulerSortBy = 'reignStart' | 'name';

/**
 * 清朝统治者服务类
 */
export const qingRulerService = {
  /**
   * 获取所有清朝统治者数据
   */
  getQingRulers,

  /**
   * 根据ID获取清朝统治者
   */
  getQingRulerById,

  /**
   * 按时期筛选
   */
  filterByPeriod(rulers: QingRuler[], period: string): QingRuler[] {
    if (period === '全部' || !period) {
      return rulers;
    }
    return rulers.filter(r => getQingPeriod(r.reignStart) === period);
  },

  /**
   * 按关键词搜索（姓名或年号）
   * Requirements: 4.7
   */
  searchRulers(rulers: QingRuler[], query: string): QingRuler[] {
    if (!query || query.trim() === '') {
      return rulers;
    }
    const lowerQuery = query.toLowerCase().trim();
    return rulers.filter(ruler => {
      // 搜索姓名
      if (ruler.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索庙号
      if (ruler.templeName.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索年号
      if (ruler.eraName.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      return false;
    });
  },

  /**
   * 排序
   * Requirements: 4.8
   */
  sortRulers(rulers: QingRuler[], sortBy: QingRulerSortBy): QingRuler[] {
    const sorted = [...rulers];
    switch (sortBy) {
      case 'reignStart':
        return sorted.sort((a, b) => a.reignStart - b.reignStart);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      default:
        return sorted;
    }
  },

  /**
   * 综合筛选、搜索、排序
   */
  filterAndSort(
    rulers: QingRuler[],
    options: {
      period?: string;
      query?: string;
      sortBy?: QingRulerSortBy;
    }
  ): QingRuler[] {
    let result = rulers;

    // 按时期筛选
    if (options.period) {
      result = this.filterByPeriod(result, options.period);
    }

    // 按关键词搜索
    if (options.query) {
      result = this.searchRulers(result, options.query);
    }

    // 排序
    if (options.sortBy) {
      result = this.sortRulers(result, options.sortBy);
    }

    return result;
  },

  /**
   * 格式化在位时间
   */
  formatReignPeriod(ruler: QingRuler): string {
    return `${ruler.reignStart}年 - ${ruler.reignEnd}年`;
  },

  /**
   * 计算在位年数
   */
  calculateReignYears(ruler: QingRuler): number {
    return ruler.reignEnd - ruler.reignStart;
  },

  /**
   * 获取统治者称号（庙号 + 年号）
   */
  getTitle(ruler: QingRuler): string {
    if (ruler.templeName === '（无庙号）') {
      return `${ruler.eraName}帝`;
    }
    return `清${ruler.templeName}（${ruler.eraName}）`;
  }
};

export default qingRulerService;
