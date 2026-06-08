import type { PhilosophicalSchool, PhilosophicalSchoolMutationInput } from './types';
import type { BaseService } from '../base/types';

export interface SchoolsService extends BaseService<PhilosophicalSchool> {
  getSchools(): Promise<{ data: PhilosophicalSchool[] }>;
  getSchool(id: string): Promise<{ data: PhilosophicalSchool | null }>;
  createSchool(input: PhilosophicalSchoolMutationInput): Promise<{ data: PhilosophicalSchool }>;
  updateSchool(id: string, input: Partial<PhilosophicalSchoolMutationInput>): Promise<{ data: PhilosophicalSchool }>;
  deleteSchool(id: string): Promise<{ data: PhilosophicalSchool | null }>;
}
