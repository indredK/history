import type { ScholarService } from './scholarService';
import type { Scholar } from './types';
import { loadJsonArray } from '@/utils/services/dataLoaders';

// 缓存加载的学者数据
let cachedScholars: Scholar[] | null = null;

// 模拟网络延迟
async function delay(ms: number = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 学者服务的 Mock 实现
 * 从本地 JSON 文件加载数据，实现数据缓存避免重复请求
 */
export const scholarMock: ScholarService = {
  /**
   * 获取所有学者列表
   * 实现数据缓存，避免重复请求
   */
  getScholars: async () => {
    await delay();
    
    // 如果已有缓存，直接返回
    if (cachedScholars) {
      return { data: cachedScholars };
    }

    // 从 JSON 文件加载数据
    const scholars = await loadJsonArray<Scholar>('/data/json/scholars.json');
    cachedScholars = scholars;
    return { data: cachedScholars };
  },

  /**
   * 根据 ID 获取单个学者
   */
  getScholarById: async (id: string) => {
    await delay();
    
    // 如果没有缓存，先加载数据
    if (!cachedScholars) {
      const scholars = await loadJsonArray<Scholar>('/data/json/scholars.json');
      cachedScholars = scholars;
    }
    
    const scholar = cachedScholars.find(s => s.id === id);
    
    if (!scholar) {
      const err = new Error('Scholar not found');
      // @ts-expect-error decorate error with status
      err.status = 404;
      throw err;
    }
    
    return { data: scholar };
  },
};

/**
 * 清除学者数据缓存
 * 用于测试或强制刷新数据
 */
export function clearScholarCache(): void {
  cachedScholars = null;
}

/**
 * 检查是否有缓存数据
 * 用于测试验证缓存行为
 */
export function hasScholarCache(): boolean {
  return cachedScholars !== null;
}

// 导出个别函数以兼容统一数据客户端
export const getScholars = scholarMock.getScholars;
export const getScholarById = scholarMock.getScholarById;
