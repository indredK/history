import type { Place } from './types';
import type { BaseService } from '../base/types';

export interface MapService extends BaseService<Place> {
  getPlaces(): Promise<{ data: Place[] }>;
}
