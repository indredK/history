import type { Scholar } from './types';
import { getScholars, getScholarById } from './scholarDataClient';

export type ScholarSortBy = 'dynasty' | 'name' | 'birthYear';

/**
 * 学者服务接口
 * 定义获取学者数据的方法
 */
export interface ScholarService {
  /**
   * 获取所有学者列表
   * @returns Promise 包含学者数组的响应对象
   */
  getScholars(): Promise<{ data: Scholar[] }>;

  /**
   * 根据 ID 获取单个学者
   * @param id - 学者的唯一标识符
   * @returns Promise 包含学者对象的响应对象，如果不存在则为null
   */
  getScholarById(id: string): Promise<{ data: Scholar | null }>;
}

/**
 * 学者服务实现
 */
export const scholarService = {
  /**
   * 获取所有学者数据
   */
  getScholars,

  /**
   * 根据ID获取学者
   */
  getScholarById,

  /**
   * 按朝代筛选学者
   */
  filterByDynasty(scholars: Scholar[], dynasty: string): Scholar[] {
    if (dynasty === '全部' || !dynasty) {
      return scholars;
    }
    return scholars.filter(s => s.dynasty === dynasty || s.dynastyPeriod === dynasty);
  },

  /**
   * 按学派筛选学者
   */
  filterBySchool(scholars: Scholar[], school: string): Scholar[] {
    if (school === '全部' || !school) {
      return scholars;
    }
    return scholars.filter(s => s.schoolOfThought === school);
  },

  /**
   * 按关键词搜索学者
   */
  searchScholars(scholars: Scholar[], query: string): Scholar[] {
    if (!query || query.trim() === '') {
      return scholars;
    }
    const lowerQuery = query.toLowerCase().trim();
    return scholars.filter(scholar => {
      // 搜索姓名
      if (scholar.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索英文名
      if (scholar.name_en?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索学派
      if (scholar.schoolOfThought?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索朝代
      if (scholar.dynasty?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // 搜索朝代时期
      if (scholar.dynastyPeriod?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      return false;
    });
  },

  /**
   * 排序学者
   */
  sortScholars(scholars: Scholar[], sortBy: ScholarSortBy): Scholar[] {
    const sorted = [...scholars];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'dynasty':
        return sorted.sort((a, b) => {
          const dynastyA = a.dynasty || a.dynastyPeriod || '';
          const dynastyB = b.dynasty || b.dynastyPeriod || '';
          return dynastyA.localeCompare(dynastyB);
        });
      case 'birthYear':
        return sorted.sort((a, b) => {
          const yearA = a.birthYear || 0;
          const yearB = b.birthYear || 0;
          return yearA - yearB;
        });
      default:
        return sorted;
    }
  },

  /**
   * 综合筛选、搜索、排序
   */
  filterAndSort(
    scholars: Scholar[],
    options: {
      dynasty?: string;
      school?: string;
      query?: string;
      sortBy?: ScholarSortBy;
    }
  ): Scholar[] {
    let result = scholars;

    // 按朝代筛选
    if (options.dynasty) {
      result = this.filterByDynasty(result, options.dynasty);
    }

    // 按学派筛选
    if (options.school) {
      result = this.filterBySchool(result, options.school);
    }

    // 按关键词搜索
    if (options.query) {
      result = this.searchScholars(result, options.query);
    }

    // 排序
    if (options.sortBy) {
      result = this.sortScholars(result, options.sortBy);
    }

    return result;
  }
};