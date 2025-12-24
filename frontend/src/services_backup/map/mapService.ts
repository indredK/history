import type { Place, BoundaryGeoJSON, BoundaryMapping } from './types';
import type { BaseService } from '../base/types';

export interface MapService extends BaseService<Place> {
  getPlaces(): Promise<{ data: Place[] }>;
  loadBoundaryData(period: string): Promise<BoundaryGeoJSON | null>;
  getBoundaryDataByYear(year: number): Promise<BoundaryGeoJSON | null>;
  loadBoundaryMappings(): Promise<BoundaryMapping[]>;
  preloadCommonData(): Promise<void>;
  clearCache(key?: string): void;
  getCacheStats(): { cacheSize: number; loadingCount: number; cachedKeys: string[] };
}
