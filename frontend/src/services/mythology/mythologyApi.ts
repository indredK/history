/**
 * 神话 API 调用
 * Mythology API Client
 * 
 * Requirements: 1.3
 */

import type { Mythology } from './types';
import { mockMythologies } from './mythologyMock';
import { validateMythology } from './mythologyService';
import { getDataSourceMode } from '@/config/dataSource';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

/**
 * API 响应接口
 */
export interface MythologyApiResponse {
  data: Mythology[];
  success: boolean;
  message?: string;
}

// 创建API客户端
const api = createApiClient();

/**
 * 从真实API获取神话数据
 */
async function fetchMythologiesFromApi(): Promise<MythologyApiResponse> {
  try {
    const response = await api.get('/mythologies');
    const result = handleApiResponse<Mythology>(response);
    return {
      data: result.data,
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
 * 从Mock数据获取神话数据
 */
async function fetchMythologiesFromMock(): Promise<MythologyApiResponse> {
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
 * 获取所有神话数据
 * 根据数据源配置自动选择API或Mock数据
 */
export async function fetchMythologies(): Promise<MythologyApiResponse> {
  const dataSourceMode = getDataSourceMode();
  
  if (dataSourceMode === 'api') {
    return fetchMythologiesFromApi();
  } else {
    return fetchMythologiesFromMock();
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
