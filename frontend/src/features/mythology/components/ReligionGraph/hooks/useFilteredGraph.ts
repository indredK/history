/**
 * 筛选关系图节点/边的 hook
 */

import { useMemo } from 'react';
import type { ReligionGraphData } from '@/services/religion/types';

export interface FilteredGraph {
  filteredNodes: ReligionGraphData['nodes'];
  filteredEdges: ReligionGraphData['edges'];
}

export function useFilteredGraph(
  graphData: ReligionGraphData | null,
  selectedSects: string[],
  searchQuery: string
): FilteredGraph {
  return useMemo(() => {
    if (!graphData) return { filteredNodes: [], filteredEdges: [] };

    let nodes = graphData.nodes;

    // 按门派筛选
    if (selectedSects.length > 0) {
      nodes = nodes.filter((node) => {
        if (node.type === 'sect') {
          return selectedSects.some(
            (sect) => node.name === sect || node.id.includes(sect.toLowerCase())
          );
        }
        return node.sect && selectedSects.includes(node.sect);
      });
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      nodes = nodes.filter(
        (node) =>
          node.name.toLowerCase().includes(normalizedQuery) ||
          node.title?.toLowerCase().includes(normalizedQuery) ||
          node.description.toLowerCase().includes(normalizedQuery)
      );
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = graphData.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    return { filteredNodes: nodes, filteredEdges: edges };
  }, [graphData, selectedSects, searchQuery]);
}
