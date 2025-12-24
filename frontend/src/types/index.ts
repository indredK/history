// 统一导出所有类型定义
export type { Dynasty } from '@/services/culture/types';
export type { CommonPerson } from '@/services/person/common/types';
export type { Event } from '@/services/timeline/types';
export type { 
  Place, 
  BoundaryFeature, 
  BoundaryGeoJSON, 
  ViewportState,
  MapInteractionInfo 
} from '@/services/map/types';

// 人物相关类型
export type { Emperor } from '@/services/person/emperors/types';
export type { Scholar } from '@/services/person/scholars/types';
export type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from '@/services/person/sanguo/types';
export type { TangFigure, TangFigureRole } from '@/services/person/tang/types';
export type { SongFigure, SongFigureRole } from '@/services/person/song/types';
export type { YuanFigure, YuanFigureRole } from '@/services/person/yuan/types';
export type { MingFigure, MingFigureRole } from '@/services/person/ming/types';
export type { QingRuler } from '@/services/person/qing/types';

// 通用类型
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface FilterParams {
  dynasty?: string;
  period?: string;
  category?: string;
}