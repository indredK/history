import { createUnifiedService } from '../base/serviceFactory';
import type { ReligionGraphData } from './types';

// 数据转换器
function transformJsonToReligion(jsonReligion: any): ReligionGraphData {
  return {
    nodes: jsonReligion.nodes || [],
    edges: jsonReligion.edges || [],
    metadata: jsonReligion.metadata || { version: '', lastUpdated: '', sources: [] },
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<ReligionGraphData>(
  '/religions',
  '/data/json/religions.json',
  transformJsonToReligion
);

// 保持向后兼容的导出
export async function getReligionGraphData() {
  const result = await unifiedService.getAll();
  const data = Array.isArray(result.data) ? result.data[0] : result.data;
  return {
    success: true,
    data: data || { nodes: [], edges: [], metadata: { version: '', lastUpdated: '', sources: [] } },
    message: undefined
  };
}

export async function getReligionNodeById(id: string) {
  try {
    const graphResult = await getReligionGraphData();
    if (!graphResult.success || !graphResult.data) {
      return { success: false, data: null, message: '获取数据失败' };
    }
    
    const node = graphResult.data.nodes.find(n => n.id === id);
    return {
      success: true,
      data: node || null,
      message: undefined
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '获取节点失败'
    };
  }
}

export async function searchReligionNodes(query: string) {
  try {
    const graphResult = await getReligionGraphData();
    if (!graphResult.success || !graphResult.data) {
      return { success: false, data: [], message: '获取数据失败' };
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return { success: true, data: [], message: undefined };
    }
    
    const matchedNodes = graphResult.data.nodes.filter(node => 
      node.name.toLowerCase().includes(normalizedQuery) ||
      node.title?.toLowerCase().includes(normalizedQuery) ||
      node.description.toLowerCase().includes(normalizedQuery)
    );
    
    return {
      success: true,
      data: matchedNodes,
      message: undefined
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : '搜索失败'
    };
  }
}
