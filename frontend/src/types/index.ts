// 统一导出所有类型定义
export type { Dynasty } from '@/services/culture/types';
export type { Person } from '@/services/person/types';
export type { Event } from '@/services/timeline/types';
export type { 
  Place, 
  BoundaryFeature, 
  BoundaryGeoJSON, 
  ViewportState,
  MapInteractionInfo 
} from '@/services/map/types';

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