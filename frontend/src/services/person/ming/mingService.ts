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
import type { BaseService } from '@/utils/services/serviceFactory';
import { createFigureServiceHelper } from '../createFigureServiceHelper';

export type MingFigureSortBy = 'birthYear' | 'name' | 'role';

/**
 * 明朝人物服务接口
 */
export interface MingFigureService extends BaseService<MingFigure> {
  getMingFigures(): Promise<{ data: MingFigure[] }>;
  getMingFigureById(id: string): Promise<{ data: MingFigure | null }>;
  getRoleTypes(): string[];
  getFactions(): string[];

  // 数据处理方法
  filterByRole(figures: MingFigure[], role: MingFigureRole | '全部'): MingFigure[];
  filterByPeriod(figures: MingFigure[], period: string): MingFigure[];
  filterByFaction(figures: MingFigure[], faction: string): MingFigure[];
  searchFigures(figures: MingFigure[], query: string): MingFigure[];
  sortFigures(figures: MingFigure[], sortBy: MingFigureSortBy): MingFigure[];
  filterAndSort(
    figures: MingFigure[],
    options: {
      role?: MingFigureRole | '全部';
      period?: string;
      faction?: string;
      query?: string;
      sortBy?: MingFigureSortBy;
    }
  ): MingFigure[];
  getRoleLabel(role: MingFigureRole): string;
  formatLifespan(figure: MingFigure): string;
  calculateAge(figure: MingFigure): number;
}

// 使用工厂创建明朝人物服务的辅助方法
export const mingFigureServiceHelper = createFigureServiceHelper<MingFigure, MingFigureRole, MingFigureSortBy>({
  roleLabels: ROLE_LABELS,
  getPeriod: getMingPeriod,
  roleOrder: {
    emperor: 1, cabinet: 2, general: 3, official: 4, eunuch: 5, other: 6,
  },
});
