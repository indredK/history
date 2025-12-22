import type { Scholar } from './types';

/**
 * 学者服务接口
 * 定义获取学者数据的方法
 */
export interface ScholarService {
  /**
   * 获取所有学者列表
   * @returns Promise 包含学者数组的响应对象
   */
  getScholars(): Promise<{ data: Scholar[] }>;

  /**
   * 根据 ID 获取单个学者
   * @param id - 学者的唯一标识符
   * @returns Promise 包含学者对象的响应对象
   * @throws Error 当学者不存在时抛出 404 错误
   */
  getScholarById(id: string): Promise<{ data: Scholar }>;
}
