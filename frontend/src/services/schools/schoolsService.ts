import type { PhilosophicalSchool } from './types';

/**
 * 思想流派服务接口
 */
export interface SchoolsService {
  getSchools: () => Promise<{ data: PhilosophicalSchool[] }>;
  getSchoolById: (id: string) => Promise<{ data: PhilosophicalSchool | null }>;
}
