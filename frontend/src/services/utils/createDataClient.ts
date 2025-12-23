import { getDataSourceMode } from '@/config/dataSource';

/**
 * 创建统一的数据客户端
 * 根据数据源配置自动选择API或Mock数据
 */
export function createDataClient<T>(apiService: T, mockService: T): T {
  const dataSourceMode = getDataSourceMode();
  
  if (dataSourceMode === 'api') {
    return apiService;
  } else {
    return mockService;
  }
}

/**
 * 创建数据获取函数
 * 根据数据源配置自动选择API或Mock数据
 */
export function createDataFetcher<TArgs extends any[], TReturn>(
  apiFetcher: (...args: TArgs) => TReturn,
  mockFetcher: (...args: TArgs) => TReturn
): (...args: TArgs) => TReturn {
  const dataSourceMode = getDataSourceMode();
  
  if (dataSourceMode === 'api') {
    return apiFetcher;
  } else {
    return mockFetcher;
  }
}