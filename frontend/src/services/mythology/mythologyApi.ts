/**
 * 神话 API 调用
 * Mythology API Client
 * 
 * Requirements: 1.3
 */

import type { Mythology } from './types';
import { mockMythologies } from './mythologyMock';
import { validateMythology } from './mythologyService';

/**
 * API 响应接口
 */
export interface MythologyApiResponse {
  data: Mythology[];
  success: boolean;
  message?: string;
}

/**
 * 获取所有神话数据
 * 当前使用 Mock 数据，后续可替换为真实 API 调用
 */
export async function fetchMythologies(): Promise<MythologyApiResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    // 验证并过滤有效数据
    const validMythologies = mockMythologies.filter(m => {
      const validation = validateMythology(m);
      if (!validation.valid) {
        console.warn(`Invalid mythology data: ${m.id}`, validation.errors);
      }
      return validation.valid;
    });
    
    return {
      data: validMythologies,
      success: true
    };
  } catch (error) {
    return {
      data: [],
      success: false,
      message: error instanceof Error ? error.message : '获取神话数据失败'
    };
  }
}

/**
 * 根据 ID 获取单个神话
 */
export async function fetchMythologyById(id: string): Promise<Mythology | null> {
  const response = await fetchMythologies();
  if (!response.success) return null;
  return response.data.find(m => m.id === id) || null;
}
