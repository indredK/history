/**
 * 唐朝人物数据服务
 * Tang Dynasty Figure Data Service
 */

import type { TangFigure, TangFigureRole } from './types';
import { ROLE_LABELS, getTangPeriod } from './types';
import type { BaseService } from '../../base/types';
import { createFigureServiceHelper } from '../createFigureServiceHelper';

export type TangFigureSortBy = 'birthYear' | 'name' | 'role';

export interface TangFigureService extends BaseService<TangFigure> {
  getTangFigures(): Promise<{ data: TangFigure[] }>;
  getTangFigureById(id: string): Promise<{ data: TangFigure | null }>;
  getRoleTypes(): string[];
  getFactions(): string[];

  // 数据处理方法
  filterByRole(figures: TangFigure[], role: TangFigureRole | '全部'): TangFigure[];
  filterByPeriod(figures: TangFigure[], period: string): TangFigure[];
  filterByFaction(figures: TangFigure[], faction: string): TangFigure[];
  searchFigures(figures: TangFigure[], query: string): TangFigure[];
  sortFigures(figures: TangFigure[], sortBy: TangFigureSortBy): TangFigure[];
  filterAndSort(
    figures: TangFigure[],
    options: {
      role?: TangFigureRole | '全部';
      period?: string;
      faction?: string;
      query?: string;
      sortBy?: TangFigureSortBy;
    }
  ): TangFigure[];
  getRoleLabel(role: TangFigureRole): string;
  formatLifespan(figure: TangFigure): string;
  calculateAge(figure: TangFigure): number;
}

// 使用工厂创建唐朝人物服务的辅助方法
export const tangFigureServiceHelper = createFigureServiceHelper<TangFigure, TangFigureRole, TangFigureSortBy>({
  roleLabels: ROLE_LABELS,
  getPeriod: getTangPeriod,
  roleOrder: {
    emperor: 1, chancellor: 2, general: 3, official: 4, poet: 5, other: 6,
  },
});
