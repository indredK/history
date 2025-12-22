/**
 * 宗教关系数据类型定义
 * Religion Relationship Data Type Definitions
 * 
 * Requirements: 4.1, 4.2, 4.5
 */

/**
 * 宗教/神仙节点类型
 */
export type ReligionNodeType = 
  | 'deity'      // 神仙
  | 'sect'       // 门派/教派
  | 'realm'      // 境界/天界
  | 'artifact';  // 法宝

/**
 * 关系类型
 */
export type RelationshipType = 
  | '师徒'       // master-disciple
  | '同门'       // fellow disciples
  | '敌对'       // adversary
  | '从属'       // subordinate
  | '夫妻'       // spouse
  | '兄弟'       // siblings
  | '化身'       // incarnation
  | '主仆';      // master-servant

/**
 * 门派类型
 */
export type SectType = 
  | '阐教'       // Chanjiao - 元始天尊
  | '截教'       // Jiejiao - 通天教主
  | '西方教'     // Western Buddhism - 接引/准提
  | '人教'       // Renjiao - 太上老君
  | '天庭'       // Heavenly Court
  | '佛门'       // Buddhism
  | '妖族'       // Demon Clan
  | '其他';      // Other

/**
 * 有效的门派列表
 */
export const VALID_SECTS: SectType[] = [
  '阐教',
  '截教',
  '西方教',
  '人教',
  '天庭',
  '佛门',
  '妖族',
  '其他'
];

/**
 * 有效的关系类型列表
 */
export const VALID_RELATIONSHIPS: RelationshipType[] = [
  '师徒',
  '同门',
  '敌对',
  '从属',
  '夫妻',
  '兄弟',
  '化身',
  '主仆'
];

/**
 * 宗教节点数据接口
 */
export interface ReligionNode {
  /** 唯一标识符 */
  id: string;
  /** 名称 */
  name: string;
  /** 节点类型 */
  type: ReligionNodeType;
  /** 描述 */
  description: string;
  /** 所属门派 */
  sect?: SectType;
  /** 称号 */
  title?: string;
  /** 头像/图标 URL */
  imageUrl?: string;
  /** 出处 */
  source?: string;
  /** 额外属性 */
  attributes?: {
    /** 法力/能力 */
    power?: string;
    /** 法宝 */
    weapon?: string;
    /** 坐骑 */
    mount?: string;
  };
}

/**
 * 关系边数据接口
 */
export interface ReligionEdge {
  /** 唯一标识符 */
  id: string;
  /** 源节点 ID */
  source: string;
  /** 目标节点 ID */
  target: string;
  /** 关系类型 */
  relationship: RelationshipType;
  /** 关系描述 */
  description?: string;
  /** 是否双向关系 */
  bidirectional?: boolean;
}

/**
 * 宗教关系图完整数据结构
 */
export interface ReligionGraphData {
  /** 节点列表 */
  nodes: ReligionNode[];
  /** 边列表 */
  edges: ReligionEdge[];
  /** 元数据 */
  metadata: {
    /** 数据版本 */
    version: string;
    /** 最后更新时间 */
    lastUpdated: string;
    /** 数据来源 */
    sources: string[];
  };
}

/**
 * 宗教关系状态接口（用于 Zustand store）
 */
export interface ReligionState {
  /** 图数据 */
  graphData: ReligionGraphData | null;
  /** 选中的节点 */
  selectedNode: ReligionNode | null;
  /** 悬停的节点 */
  hoveredNode: ReligionNode | null;
  /** 高亮的节点 ID 集合 */
  highlightedNodes: Set<string>;
  /** 高亮的边 ID 集合 */
  highlightedEdges: Set<string>;
  /** 筛选的门派 */
  selectedSects: SectType[];
  /** 搜索关键词 */
  searchQuery: string;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 宗教关系操作接口（用于 Zustand store）
 */
export interface ReligionActions {
  /** 设置图数据 */
  setGraphData: (data: ReligionGraphData) => void;
  /** 设置选中节点 */
  setSelectedNode: (node: ReligionNode | null) => void;
  /** 设置悬停节点 */
  setHoveredNode: (node: ReligionNode | null) => void;
  /** 设置高亮节点 */
  setHighlightedNodes: (nodeIds: Set<string>) => void;
  /** 设置高亮边 */
  setHighlightedEdges: (edgeIds: Set<string>) => void;
  /** 设置筛选门派 */
  setSelectedSects: (sects: SectType[]) => void;
  /** 设置搜索关键词 */
  setSearchQuery: (query: string) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置错误信息 */
  setError: (error: string | null) => void;
  /** 获取筛选后的节点 */
  getFilteredNodes: () => ReligionNode[];
  /** 获取筛选后的边 */
  getFilteredEdges: () => ReligionEdge[];
  /** 获取节点的相关节点和边 */
  getRelatedNodesAndEdges: (nodeId: string) => {
    nodes: ReligionNode[];
    edges: ReligionEdge[];
  };
  /** 重置筛选 */
  resetFilters: () => void;
}

/**
 * 宗教关系 Store 类型（状态 + 操作）
 */
export type ReligionStore = ReligionState & ReligionActions;

/**
 * 节点颜色配置
 */
export const NODE_COLORS: Record<ReligionNodeType, { fill: string; stroke: string }> = {
  deity: { fill: '#FFD700', stroke: '#DAA520' },    // 金色 - 神仙
  sect: { fill: '#9C27B0', stroke: '#7B1FA2' },     // 紫色 - 门派
  realm: { fill: '#2196F3', stroke: '#1976D2' },    // 蓝色 - 境界
  artifact: { fill: '#4CAF50', stroke: '#388E3C' }, // 绿色 - 法宝
};

/**
 * 门派颜色配置
 */
export const SECT_COLORS: Record<SectType, string> = {
  '阐教': '#E91E63',    // 粉红
  '截教': '#673AB7',    // 深紫
  '西方教': '#FF9800',  // 橙色
  '人教': '#795548',    // 棕色
  '天庭': '#2196F3',    // 蓝色
  '佛门': '#FFC107',    // 金黄
  '妖族': '#F44336',    // 红色
  '其他': '#9E9E9E',    // 灰色
};

/**
 * 关系颜色配置
 */
export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  '师徒': '#4CAF50',    // 绿色
  '同门': '#2196F3',    // 蓝色
  '敌对': '#F44336',    // 红色
  '从属': '#9C27B0',    // 紫色
  '夫妻': '#E91E63',    // 粉红
  '兄弟': '#FF9800',    // 橙色
  '化身': '#00BCD4',    // 青色
  '主仆': '#795548',    // 棕色
};
