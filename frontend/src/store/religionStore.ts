/**
 * 宗教关系状态管理
 * Religion Relationship State Management
 * 
 * Requirements: 5.2, 6.2, 6.4, 6.5
 */

import { create } from 'zustand';
import type { 
  ReligionStore, 
  ReligionNode, 
  ReligionEdge, 
  ReligionGraphData,
  SectType 
} from '@/services/religion/types';

// 视图模式类型
export type ViewMode = 'force' | 'tree';

interface ExtendedReligionStore extends ReligionStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useReligionStore = create<ExtendedReligionStore>((set, get) => ({
  // 初始状态
  graphData: null,
  selectedNode: null,
  hoveredNode: null,
  highlightedNodes: new Set<string>(),
  highlightedEdges: new Set<string>(),
  selectedSects: [],
  searchQuery: '',
  loading: false,
  error: null,
  viewMode: 'force',

  // 设置视图模式
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  // 设置图数据
  setGraphData: (data: ReligionGraphData) => set({ graphData: data }),

  // 设置选中节点
  setSelectedNode: (node: ReligionNode | null) => set({ selectedNode: node }),

  // 设置悬停节点并更新高亮
  setHoveredNode: (node: ReligionNode | null) => {
    if (!node) {
      set({ 
        hoveredNode: null, 
        highlightedNodes: new Set<string>(), 
        highlightedEdges: new Set<string>() 
      });
      return;
    }

    const { graphData } = get();
    if (!graphData) {
      set({ hoveredNode: node });
      return;
    }

    // 找到所有相关的边和节点
    const relatedEdges = new Set<string>();
    const relatedNodes = new Set<string>([node.id]);

    graphData.edges.forEach(edge => {
      if (edge.source === node.id || edge.target === node.id) {
        relatedEdges.add(edge.id);
        relatedNodes.add(edge.source);
        relatedNodes.add(edge.target);
      }
    });

    set({
      hoveredNode: node,
      highlightedNodes: relatedNodes,
      highlightedEdges: relatedEdges,
    });
  },

  // 设置高亮节点
  setHighlightedNodes: (nodeIds: Set<string>) => set({ highlightedNodes: nodeIds }),

  // 设置高亮边
  setHighlightedEdges: (edgeIds: Set<string>) => set({ highlightedEdges: edgeIds }),

  // 设置筛选门派
  setSelectedSects: (sects: SectType[]) => set({ selectedSects: sects }),

  // 设置搜索关键词
  setSearchQuery: (query: string) => {
    const { graphData } = get();
    set({ searchQuery: query });

    if (!query.trim() || !graphData) {
      set({ highlightedNodes: new Set<string>() });
      return;
    }

    // 搜索匹配的节点
    const normalizedQuery = query.toLowerCase().trim();
    const matchedNodes = new Set<string>();

    graphData.nodes.forEach(node => {
      if (
        node.name.toLowerCase().includes(normalizedQuery) ||
        node.title?.toLowerCase().includes(normalizedQuery)
      ) {
        matchedNodes.add(node.id);
      }
    });

    set({ highlightedNodes: matchedNodes });
  },

  // 设置加载状态
  setLoading: (loading: boolean) => set({ loading }),

  // 设置错误信息
  setError: (error: string | null) => set({ error }),

  // 获取筛选后的节点
  getFilteredNodes: (): ReligionNode[] => {
    const { graphData, selectedSects, searchQuery } = get();
    
    if (!graphData) return [];

    let filteredNodes = graphData.nodes;

    // 按门派筛选
    if (selectedSects.length > 0) {
      filteredNodes = filteredNodes.filter(node => {
        // 门派节点始终显示
        if (node.type === 'sect') {
          return selectedSects.some(sect => node.name === sect || node.id.includes(sect.toLowerCase()));
        }
        // 其他节点按所属门派筛选
        return node.sect && selectedSects.includes(node.sect);
      });
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      filteredNodes = filteredNodes.filter(node =>
        node.name.toLowerCase().includes(normalizedQuery) ||
        node.title?.toLowerCase().includes(normalizedQuery) ||
        node.description.toLowerCase().includes(normalizedQuery)
      );
    }

    return filteredNodes;
  },

  // 获取筛选后的边
  getFilteredEdges: (): ReligionEdge[] => {
    const { graphData } = get();
    const filteredNodes = get().getFilteredNodes();
    
    if (!graphData) return [];

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    // 只保留两端节点都在筛选结果中的边
    return graphData.edges.filter(edge =>
      filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );
  },

  // 获取节点的相关节点和边
  getRelatedNodesAndEdges: (nodeId: string) => {
    const { graphData } = get();
    
    if (!graphData) {
      return { nodes: [], edges: [] };
    }

    const relatedEdges: ReligionEdge[] = [];
    const relatedNodeIds = new Set<string>();

    graphData.edges.forEach(edge => {
      if (edge.source === nodeId || edge.target === nodeId) {
        relatedEdges.push(edge);
        relatedNodeIds.add(edge.source);
        relatedNodeIds.add(edge.target);
      }
    });

    // 移除当前节点
    relatedNodeIds.delete(nodeId);

    const relatedNodes = graphData.nodes.filter(node => relatedNodeIds.has(node.id));

    return { nodes: relatedNodes, edges: relatedEdges };
  },

  // 重置筛选
  resetFilters: () => set({
    selectedSects: [],
    searchQuery: '',
    highlightedNodes: new Set<string>(),
    highlightedEdges: new Set<string>(),
  }),
}));
