import type { Dynasty } from './types';

export interface DynastiesService {
  getDynasties(): Promise<{ data: Dynasty[] }>;
}
