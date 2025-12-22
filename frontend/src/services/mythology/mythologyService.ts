/**
 * 神话服务层
 * Mythology Service Layer
 * 
 * Requirements: 1.3
 */

import type { Mythology, MythologyCategory } from './types';
import { VALID_CATEGORIES } from './types';
import { fetchMythologies, fetchMythologyById } from './mythologyApi';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 验证神话数据
 * 检查必填字段和分类有效性
 */
export function validateMythology(mythology: Partial<Mythology>): ValidationResult {
  const errors: string[] = [];
  
  // 检查必填字段
  if (!mythology.id || mythology.id.trim() === '') {
    errors.push('id 字段不能为空');
  }
  
  if (!mythology.title || mythology.title.trim() === '') {
    errors.push('title 字段不能为空');
  }
  
  if (!mythology.category) {
    errors.push('category 字段不能为空');
  } else if (!VALID_CATEGORIES.includes(mythology.category as MythologyCategory)) {
    errors.push(`category 必须是以下值之一: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  if (!mythology.description || mythology.description.trim() === '') {
    errors.push('description 字段不能为空');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 检查分类是否有效
 */
export function isValidCategory(category: string): category is MythologyCategory {
  return VALID_CATEGORIES.includes(category as MythologyCategory);
}

/**
 * 按分类筛选神话
 */
export function filterByCategory(
  mythologies: Mythology[], 
  category: MythologyCategory | null
): Mythology[] {
  if (category === null) {
    return mythologies;
  }
  return mythologies.filter(m => m.category === category);
}

/**
 * 获取所有神话数据
 */
export async function getMythologies() {
  return fetchMythologies();
}

/**
 * 根据 ID 获取神话
 */
export async function getMythologyById(id: string) {
  return fetchMythologyById(id);
}

/**
 * 获取所有分类
 */
export function getAllCategories(): MythologyCategory[] {
  return [...VALID_CATEGORIES];
}
