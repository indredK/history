import type { SchoolsService } from './schoolsService';
import type { PhilosophicalSchool } from './types';
import { loadJsonArray } from '@/utils/dataLoaders';

// 缓存加载的思想流派数据
let cachedSchools: PhilosophicalSchool[] | null = null;

// 模拟网络延迟
async function delay(ms: number = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 思想流派服务的 Mock 实现
 * 从本地 JSON 文件加载数据，实现数据缓存避免重复请求
 */
export const schoolsMock: SchoolsService = {
  /**
   * 获取所有思想流派列表
   * 实现数据缓存，避免重复请求
   */
  getSchools: async () => {
    await delay();
    
    // 如果已有缓存，直接返回
    if (cachedSchools) {
      return { data: cachedSchools };
    }

    // 从 JSON 文件加载数据
    const schools = await loadJsonArray<PhilosophicalSchool>('/data/json/schools.json');
    cachedSchools = schools;
    return { data: cachedSchools };
  },

  /**
   * 根据 ID 获取单个思想流派
   */
  getSchoolById: async (id: string) => {
    await delay();
    
    // 如果没有缓存，先加载数据
    if (!cachedSchools) {
      const schools = await loadJsonArray<PhilosophicalSchool>('/data/json/schools.json');
      cachedSchools = schools;
    }
    
    const school = cachedSchools.find(s => s.id === id);
    
    if (!school) {
      return { data: null };
    }
    
    return { data: school };
  },
};

/**
 * 清除思想流派数据缓存
 * 用于测试或强制刷新数据
 */
export function clearSchoolsCache(): void {
  cachedSchools = null;
}

/**
 * 检查是否有缓存数据
 * 用于测试验证缓存行为
 */
export function hasSchoolsCache(): boolean {
  return cachedSchools !== null;
}

// 导出个别函数以兼容统一数据客户端
export const getSchools = schoolsMock.getSchools;
export const getSchoolById = schoolsMock.getSchoolById;
