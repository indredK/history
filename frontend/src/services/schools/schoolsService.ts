import type { PhilosophicalSchool } from './types';
import { getDataSourceMode } from '@/config/dataSource';
import { getSchools as getSchoolsApi, getSchoolById as getSchoolByIdApi } from './schoolsApi';
import { schoolsMock } from './schoolsMock';

/**
 * 思想流派服务接口
 */
export interface SchoolsService {
  getSchools: () => Promise<{ data: PhilosophicalSchool[] }>;
  getSchoolById: (id: string) => Promise<{ data: PhilosophicalSchool | null }>;
}

/**
 * 思想流派服务实现
 */
class SchoolsServiceImpl implements SchoolsService {
  async getSchools(): Promise<{ data: PhilosophicalSchool[] }> {
    const dataSourceMode = getDataSourceMode();
    
    if (dataSourceMode === 'api') {
      return getSchoolsApi();
    } else {
      return schoolsMock.getSchools();
    }
  }

  async getSchoolById(id: string): Promise<{ data: PhilosophicalSchool | null }> {
    const dataSourceMode = getDataSourceMode();
    
    if (dataSourceMode === 'api') {
      return getSchoolByIdApi(id);
    } else {
      return schoolsMock.getSchool(id);
    }
  }
}

export const schoolsService = new SchoolsServiceImpl();
