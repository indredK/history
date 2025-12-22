/**
 * 宗教关系 API 服务
 * Religion Relationship API Service
 * 
 * Requirements: 4.6
 */

import type { ReligionGraphData } from './types';
import { mockReligionData } from './religionMock';

/**
 * API 响应类型
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * 模拟网络延迟
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 获取宗教关系图数据
 */
export async function getReligionGraphData(): Promise<ApiResponse<ReligionGraphData>> {
  try {
    // 模拟网络请求延迟
    await delay(300);
    
    return {
      success: true,
      data: mockReligionData,
    };
  } catch (error) {
    return {
      success: false,
      data: { nodes: [], edges: [], metadata: { version: '', lastUpdated: '', sources: [] } },
      message: error instanceof Error ? error.message : '获取数据失败',
    };
  }
}

/**
 * 根据 ID 获取单个节点
 */
export async function getReligionNodeById(id: string): Promise<ApiResponse<ReligionGraphData['nodes'][0] | null>> {
  try {
    await delay(100);
    
    const node = mockReligionData.nodes.find(n => n.id === id);
    
    return {
      success: true,
      data: node || null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '获取节点失败',
    };
  }
}

/**
 * 搜索节点
 */
export async function searchReligionNodes(query: string): Promise<ApiResponse<ReligionGraphData['nodes']>> {
  try {
    await delay(100);
    
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return {
        success: true,
        data: [],
      };
    }
    
    const matchedNodes = mockReligionData.nodes.filter(node => 
      node.name.toLowerCase().includes(normalizedQuery) ||
      node.title?.toLowerCase().includes(normalizedQuery) ||
      node.description.toLowerCase().includes(normalizedQuery)
    );
    
    return {
      success: true,
      data: matchedNodes,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : '搜索失败',
    };
  }
}
