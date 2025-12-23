/**
 * 宗教关系服务
 * Religion Relationship Service
 * 
 * Requirements: 4.6
 */

import type { ReligionGraphData } from './types';
import { getReligionGraphData, getReligionNodeById, searchReligionNodes } from './religionDataClient';

export const religionService = {
  getReligionGraphData,
  getReligionNodeById,
  searchReligionNodes,

  /**
   * 根据类型筛选节点
   */
  filterNodesByType(data: ReligionGraphData, type: string): ReligionGraphData['nodes'] {
    if (!type || type === '全部') return data.nodes;
    return data.nodes.filter(node => node.type === type);
  },

  /**
   * 根据时期筛选节点
   */
  filterNodesByPeriod(data: ReligionGraphData, period: string): ReligionGraphData['nodes'] {
    if (!period || period === '全部') return data.nodes;
    return data.nodes.filter(node => node.type === period);
  },

  /**
   * 获取所有节点类型
   */
  getNodeTypes(data: ReligionGraphData): string[] {
    const types = [...new Set(data.nodes.map(node => node.type))];
    return ['全部', ...types];
  },

  /**
   * 获取所有时期
   */
  getPeriods(data: ReligionGraphData): string[] {
    const periods = [...new Set(data.nodes.map(node => node.type))];
    return ['全部', ...periods];
  },

  /**
   * 获取节点的相关连接
   */
  getNodeConnections(data: ReligionGraphData, nodeId: string): ReligionGraphData['edges'] {
    return data.edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );
  },

  /**
   * 获取节点的相关节点
   */
  getRelatedNodes(data: ReligionGraphData, nodeId: string): ReligionGraphData['nodes'] {
    const connections = this.getNodeConnections(data, nodeId);
    const relatedNodeIds = new Set<string>();
    
    connections.forEach(edge => {
      if (edge.source === nodeId) {
        relatedNodeIds.add(edge.target);
      } else {
        relatedNodeIds.add(edge.source);
      }
    });

    return data.nodes.filter(node => relatedNodeIds.has(node.id));
  }
};

export default religionService;