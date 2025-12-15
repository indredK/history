import type { Place } from './types';

export interface MapService {
  getPlaces(): Promise<{ data: Place[] }>;
}
