/**
 * 宋朝人物数据服务
 * Song Dynasty Figure Data Service
 */

import type { SongFigure, SongFigureRole } from './types';
import { ROLE_LABELS, getSongPeriod } from './types';
import type { BaseService } from '../../base/serviceFactory';
import { createFigureServiceHelper } from '../createFigureServiceHelper';

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

// 使用工厂创建宋朝人物服务的辅助方法
export const songFigureServiceHelper: SongFigureService = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: () => Promise.resolve({ data: null }),
  ...createFigureServiceHelper<SongFigure, SongFigureRole, SongFigureSortBy>({
    roleLabels: ROLE_LABELS,
    getPeriod: getSongPeriod,
    roleOrder: {
      emperor: 1, chancellor: 2, general: 3, official: 4, scholar: 5, other: 6,
    },
  }),
};
