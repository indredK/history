import type { Dynasty } from './types';

export interface CultureService {
  getDynasties(): Promise<{ data: Dynasty[] }>;
}
