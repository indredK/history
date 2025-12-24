import type { Mythology } from './types';
import type { BaseService } from '../base/types';

export interface MythologyService extends BaseService<Mythology> {
  getMythologies(): Promise<{ data: Mythology[] }>;
  getMythology(id: string): Promise<{ data: Mythology | null }>;
}

/**
 * 验证神话数据
 */
export function validateMythology(mythology: Mythology): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!mythology.id) errors.push('缺少ID');
  if (!mythology.title) errors.push('缺少标题');
  if (!mythology.category) errors.push('缺少分类');
  if (!mythology.description) errors.push('缺少描述');
  if (!mythology.characters || mythology.characters.length === 0) errors.push('缺少人物');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 获取所有神话数据 - 兼容旧接口
 */
export async function getMythologies() {
  const { mythologyApi } = await import('./mythologyApi');
  return mythologyApi.getMythologies();
}

/**
 * 根据分类筛选神话
 */
export function filterByCategory(mythologies: Mythology[], category: string) {
  return mythologies.filter(m => m.category === category);
}