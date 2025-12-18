export type DataSourceMode = 'mock' | 'api' | 'json';

export function getDataSource(): DataSourceMode {
  const mode = import.meta.env.VITE_DATA_SOURCE || 'mock';
  
  // 如果是json模式，也使用mock数据源
  if (mode === 'mock' || mode === 'json') return 'mock';
  return 'api';
}

export function getMockErrorRate(): number {
  const val = import.meta.env.VITE_MOCK_ERROR_RATE || '0';
  const num = Number(val);
  if (Number.isNaN(num) || num < 0) return 0;
  if (num > 1) return 1;
  return num;
}
