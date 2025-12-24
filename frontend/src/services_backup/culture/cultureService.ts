import type { Dynasty } from './types';
import type { BaseService } from '../base/types';

export interface DynastiesService extends BaseService<Dynasty> {
  getDynasties(): Promise<{ data: Dynasty[] }>;
}
