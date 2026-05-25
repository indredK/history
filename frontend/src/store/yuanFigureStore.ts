/**
 * 元朝人物状态管理 Store
 *
 * 字段 / action 与 tang / song / ming 完全一致,统一走 createFigureStore 工厂(§2.1)。
 */

import type { YuanFigure, YuanFigureRole } from '@/services/person/yuan/types';
import {
  yuanFigureServiceHelper,
  type YuanFigureSortBy,
} from '@/services/person/yuan';
import { YUAN_PERIODS } from '@/services/person/yuan/types';
import { createFigureStore } from './createFigureStore';

export const useYuanFigureStore = createFigureStore<
  YuanFigure,
  YuanFigureRole,
  YuanFigureSortBy
>({
  service: yuanFigureServiceHelper,
  roleOptions: [
    '全部',
    'emperor',
    'chancellor',
    'general',
    'official',
    'scholar',
    'other',
  ],
  periodOptions: ['全部', ...YUAN_PERIODS.map((p) => p.name)],
  defaultSortBy: 'birthYear' as YuanFigureSortBy,
});
