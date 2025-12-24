import type { PhilosophicalSchool } from './types';
import type { BaseService } from '../base/types';

export interface SchoolsService extends BaseService<PhilosophicalSchool> {
  getSchools(): Promise<{ data: PhilosophicalSchool[] }>;
  getSchool(id: string): Promise<{ data: PhilosophicalSchool | null }>;
}