/**
 * 唐朝人物状态管理 Store
 *
 * 字段 / action 与 song / yuan / ming 完全一致,统一走 createFigureStore 工厂,
 * 仅在此处注入唐朝特有的角色与时期选项(§2.1)。
 */

import type { TangFigure, TangFigureRole } from '@/services/person/tang/types';
import { tangFigureService, type TangFigureSortBy } from '@/services/person/tang';
import { TANG_PERIODS } from '@/services/person/tang/types';
import { createFigureStore } from './createFigureStore';

export const useTangFigureStore = createFigureStore<
  TangFigure,
  TangFigureRole,
  TangFigureSortBy
>({
  service: tangFigureService,
  roleOptions: [
    '全部',
    'emperor',
    'chancellor',
    'general',
    'official',
    'poet',
    'other',
  ],
  periodOptions: ['全部', ...TANG_PERIODS.map((p) => p.name)],
  defaultSortBy: 'birthYear' as TangFigureSortBy,
});
