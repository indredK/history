/**
 * 服务基础类型定义
 */

// 统一的API响应格式
export interface ApiResponse<T> {
  data: T;
}

// 统一的服务接口基类
export interface BaseService<T, ID = string> {
  getAll(): Promise<ApiResponse<T[]>>;
  getById?(id: ID): Promise<ApiResponse<T | null>>;
}

// 分页查询参数
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}