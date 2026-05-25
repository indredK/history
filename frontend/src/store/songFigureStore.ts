/**
 * 宋朝人物状态管理 Store
 *
 * 字段 / action 与 tang / yuan / ming 完全一致,统一走 createFigureStore 工厂(§2.1)。
 */

import type { SongFigure, SongFigureRole } from '@/services/person/song/types';
import {
  songFigureServiceHelper,
  type SongFigureSortBy,
} from '@/services/person/song';
import { SONG_PERIODS } from '@/services/person/song/types';
import { createFigureStore } from './createFigureStore';

export const useSongFigureStore = createFigureStore<
  SongFigure,
  SongFigureRole,
  SongFigureSortBy
>({
  service: songFigureServiceHelper,
  roleOptions: [
    '全部',
    'emperor',
    'chancellor',
    'general',
    'official',
    'scholar',
    'other',
  ],
  periodOptions: ['全部', ...SONG_PERIODS.map((p) => p.name)],
  defaultSortBy: 'birthYear' as SongFigureSortBy,
});
