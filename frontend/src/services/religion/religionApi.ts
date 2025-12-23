/**
 * 宗教关系 API 服务
 * Religion Relationship API Service
 * 
 * Requirements: 4.6
 */

import type { ReligionGraphData } from './types';
import { mockReligionData } from './religionMock';
import { getDataSourceMode } from '@/config/dataSource';
import { createApiClient, handleApiResponse } from '../utils/apiResponseHandler';

/**
 * API 响应类型
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 创建API客户端
const api = createApiClient();

/**
 * 模拟网络延迟
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 从真实API获取宗教关系图数据
 */
async function getReligionGraphDataFromApi(): Promise<ApiResponse<ReligionGraphData>> {
  try {
    const response = await api.get('/religions');
    const result = handleApiResponse<ReligionGraphData>(response);
    
    // 确保返回正确的数据结构
    const data = Array.isArray(result.data) ? result.data[0] : result.data;
    
    return {
      success: true,
      data: data || { nodes: [], edges: [], metadata: { version: '', lastUpdated: '', sources: [] } },
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
 * 从Mock数据获取宗教关系图数据
 */
async function getReligionGraphDataFromMock(): Promise<ApiResponse<ReligionGraphData>> {
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
 * 获取宗教关系图数据
 * 根据数据源配置自动选择API或Mock数据
 */
export async function getReligionGraphData(): Promise<ApiResponse<ReligionGraphData>> {
  const dataSourceMode = getDataSourceMode();
  
  if (dataSourceMode === 'api') {
    return getReligionGraphDataFromApi();
  } else {
    return getReligionGraphDataFromMock();
  }
}

/**
 * 根据 ID 获取单个节点
 * 根据数据源配置自动选择API或Mock数据
 */
export async function getReligionNodeById(id: string): Promise<ApiResponse<ReligionGraphData['nodes'][0] | null>> {
  const dataSourceMode = getDataSourceMode();
  
  if (dataSourceMode === 'api') {
    try {
      const response = await api.get(`/religions/nodes/${id}`);
      const result = handleApiResponse<ReligionGraphData['nodes'][0]>(response);
      
      // 确保返回正确的数据结构
      const node = Array.isArray(result.data) ? result.data[0] : result.data;
      
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
  } else {
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
}

/**
 * 搜索节点
 * 根据数据源配置自动选择API或Mock数据
 */
export async function searchReligionNodes(query: string): Promise<ApiResponse<ReligionGraphData['nodes']>> {
  const dataSourceMode = getDataSourceMode();
  
  if (dataSourceMode === 'api') {
    try {
      const response = await api.get(`/religions/search?q=${encodeURIComponent(query)}`);
      const result = handleApiResponse<ReligionGraphData['nodes'][0]>(response);
      
      // 确保返回正确的数据结构
      const nodes = Array.isArray(result.data) ? result.data : [result.data].filter(Boolean);
      
      return {
        success: true,
        data: nodes,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : '搜索失败',
      };
    }
  } else {
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
}
