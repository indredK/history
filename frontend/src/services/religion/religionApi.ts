import type { ReligionService } from './religionService';
import { getDataSourceMode } from '@/config/dataSource';
import { apiClient, handleSingleApiResponse } from '@/utils/services/apiClient';
import { loadJsonArray } from '@/utils/services/dataLoaders';
import type {
  ReligionEdge,
  ReligionGraphData,
  ReligionNode,
  ReligionNodeType,
  RelationshipType,
  SectType,
} from './types';

const API_GRAPH_ENDPOINT = '/religion/graph';
const JSON_DATA_PATH = '/data/json/religions.json';

const emptyGraph: ReligionGraphData = {
  nodes: [],
  edges: [],
  metadata: { version: '', lastUpdated: '', sources: [] },
};

const nodeTypeMap: Record<string, ReligionNodeType> = {
  deity: 'deity',
  master: 'deity',
  temple: 'realm',
  sect: 'sect',
  text: 'artifact',
  concept: 'artifact',
};

const traditionMap: Record<string, SectType> = {
  taoism: '天庭',
  buddhism: '佛门',
  confucianism: '其他',
  folk_religion: '其他',
};

const relationshipMap: Record<string, RelationshipType> = {
  founded_by: '师徒',
  influenced_by: '同门',
  split_from: '同门',
  merged_with: '同门',
  located_at: '从属',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNode(rawNode: unknown): ReligionNode {
  const node = isRecord(rawNode) ? rawNode : {};
  const rawType = readString(node['type']) || readString(node['nodeType']);
  const rawSect = readString(node['sect']) || readString(node['tradition']);
  const sect = traditionMap[rawSect] || rawSect;
  const rawAttributes = node['attributes'];
  const attributes = isRecord(rawAttributes)
    ? {
        power: readString(rawAttributes['power']),
        weapon: readString(rawAttributes['weapon']),
        mount: readString(rawAttributes['mount']),
      }
    : null;

  return {
    id: readString(node['id']),
    name: readString(node['name']),
    type: nodeTypeMap[rawType] || 'deity',
    description: readString(node['description']),
    ...(sect ? { sect: sect as SectType } : {}),
    title: readString(node['title']),
    imageUrl: readString(node['imageUrl']),
    source: readString(node['source']) || readString(node['location']) || readString(node['period']),
    ...(attributes ? { attributes } : {}),
  };
}

function normalizeEdge(rawEdge: unknown): ReligionEdge {
  const edge = isRecord(rawEdge) ? rawEdge : {};
  const rawRelationship = readString(edge['relationship']);

  return {
    id: readString(edge['id']),
    source: readString(edge['source']) || readString(edge['sourceNodeId']),
    target: readString(edge['target']) || readString(edge['targetNodeId']),
    relationship:
      (relationshipMap[rawRelationship] || rawRelationship || '从属') as RelationshipType,
    description: readString(edge['description']),
    bidirectional: Boolean(edge['bidirectional']),
  };
}

// 数据转换器
function transformJsonToReligion(jsonReligion: unknown): ReligionGraphData {
  const religion = isRecord(jsonReligion) ? jsonReligion : {};
  const metadata = religion['metadata'];
  const metadataRecord = isRecord(metadata) ? metadata : null;

  return {
    nodes: Array.isArray(religion['nodes'])
      ? religion['nodes'].map((node) => normalizeNode(node))
      : [],
    edges: Array.isArray(religion['edges'])
      ? religion['edges'].map((edge) => normalizeEdge(edge))
      : [],
    metadata: metadataRecord
      ? {
          version: readString(metadataRecord['version']),
          lastUpdated: readString(metadataRecord['lastUpdated']),
          sources: Array.isArray(metadataRecord['sources'])
            ? metadataRecord['sources']
                .map((source) => readString(source))
                .filter((source) => source.length > 0)
            : [],
        }
      : { version: '', lastUpdated: '', sources: [] },
  };
}

let mockCache: ReligionGraphData | null = null;

async function getMockReligionGraph(): Promise<ReligionGraphData> {
  if (mockCache) return mockCache;
  const jsonData = await loadJsonArray(JSON_DATA_PATH);
  mockCache = jsonData[0] ? transformJsonToReligion(jsonData[0]) : emptyGraph;
  return mockCache;
}

async function getApiReligionGraph(): Promise<ReligionGraphData> {
  const response = await apiClient.get(API_GRAPH_ENDPOINT);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return transformJsonToReligion(apiResponse.data);
}

async function getReligionGraph(): Promise<{ data: ReligionGraphData }> {
  if (getDataSourceMode() === 'api') {
    try {
      return { data: await getApiReligionGraph() };
    } catch (error) {
      console.error('宗教关系 API 加载失败，回退到静态数据:', error);
    }
  }

  return { data: await getMockReligionGraph() };
}

async function getReligionNode(id: string): Promise<{ data: ReligionNode | null }> {
  const result = await getReligionGraph();
  const node = result.data.nodes.find((item) => item.id === id) || null;
  return { data: node };
}

// 实现宗教服务
export const religionApi: ReligionService = {
  getAll: async () => {
    const result = await getReligionGraph();
    return { data: [result.data] };
  },
  getReligionGraph,
  getReligionNode,
};

// 保持向后兼容的导出
export async function getReligionGraphData() {
  const result = await religionApi.getReligionGraph();
  return {
    success: true,
    data: result.data,
  };
}

export async function getReligionNodeById(id: string) {
  try {
    const result = await religionApi.getReligionNode(id);
    return {
      success: true,
      data: result.data,
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
      return { success: true, data: [] };
    }
    
    const matchedNodes = result.data.nodes.filter(node => 
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
      message: error instanceof Error ? error.message : '搜索失败'
    };
  }
}
