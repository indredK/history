/**
 * 元朝人物数据服务
 * Yuan Dynasty Figure Data Service
 */

import type { YuanFigure, YuanFigureRole } from './types';
import { ROLE_LABELS, getYuanPeriod } from './types';
import type { BaseService } from '../../base/serviceFactory';
import { createFigureServiceHelper } from '../createFigureServiceHelper';

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

// 使用工厂创建元朝人物服务的辅助方法
export const yuanFigureServiceHelper: YuanFigureService = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: () => Promise.resolve({ data: null }),
  ...createFigureServiceHelper<YuanFigure, YuanFigureRole, YuanFigureSortBy>({
    roleLabels: ROLE_LABELS,
    getPeriod: getYuanPeriod,
    roleOrder: {
      emperor: 1, chancellor: 2, general: 3, official: 4, scholar: 5, other: 6,
    },
  }),
};
