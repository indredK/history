export type DataSourceMode = 'mock' | 'api';

export function getDataSource(): DataSourceMode {
  const mode =
    (import.meta as any).env?.VITE_DATA_SOURCE ??
    (typeof process !== 'undefined' ? process.env.VITE_DATA_SOURCE : undefined) ??
    'api';
  return mode === 'mock' ? 'mock' : 'api';
}

export function getMockErrorRate(): number {
  const val =
    (import.meta as any).env?.VITE_MOCK_ERROR_RATE ??
    (typeof process !== 'undefined' ? process.env.VITE_MOCK_ERROR_RATE : undefined) ??
    '0';
  const num = Number(val);
  if (Number.isNaN(num) || num < 0) return 0;
  if (num > 1) return 1;
  return num;
}
