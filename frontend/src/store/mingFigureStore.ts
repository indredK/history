/**
 * 明朝人物状态管理 Store
 *
 * 字段 / action 与 tang / song / yuan 完全一致,统一走 createFigureStore 工厂(§2.1)。
 *
 * Requirements: 3.7, 3.8, 3.9, 6.3
 */

import type { MingFigure, MingFigureRole } from '@/services/person/ming/types';
import { mingService, type MingFigureSortBy } from '@/services/person/ming';
import { MING_PERIODS } from '@/services/person/ming/types';
import { createFigureStore } from './createFigureStore';

export const useMingFigureStore = createFigureStore<
  MingFigure,
  MingFigureRole,
  MingFigureSortBy
>({
  service: mingService,
  roleOptions: [
    '全部',
    'emperor',
    'cabinet',
    'general',
    'official',
    'eunuch',
    'other',
  ],
  periodOptions: ['全部', ...MING_PERIODS.map((p) => p.name)],
  defaultSortBy: 'birthYear' as MingFigureSortBy,
});
