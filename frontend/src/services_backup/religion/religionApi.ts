import type { ReligionService } from './religionService';
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

// 实现宗教服务
export const religionApi: ReligionService = {
  ...unifiedService,
  getReligionGraph: async () => {
    const result = await unifiedService.getAll();
    const data = Array.isArray(result.data) ? result.data[0] : result.data;
    return { data: data || { nodes: [], edges: [], metadata: { version: '', lastUpdated: '', sources: [] } } };
  },
  getReligionNode: async (id: string) => {
    const result = await unifiedService.getAll();
    const graphData = Array.isArray(result.data) ? result.data[0] : result.data;
    const node = graphData?.nodes.find(n => n.id === id) || null;
    return { data: node };
  },
};

// 保持向后兼容的导出
export async function getReligionGraphData() {
  const result = await religionApi.getReligionGraph();
  return {
    success: true,
    data: result.data,
    message: undefined
  };
}

export async function getReligionNodeById(id: string) {
  try {
    const result = await religionApi.getReligionNode(id);
    return {
      success: true,
      data: result.data,
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
    const result = await religionApi.getReligionGraph();
    if (!result.data) {
      return { success: false, data: [], message: '获取数据失败' };
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return { success: true, data: [], message: undefined };
    }
    
    const matchedNodes = result.data.nodes.filter(node => 
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
