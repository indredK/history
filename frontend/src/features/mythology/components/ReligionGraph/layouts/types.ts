/**
 * ReligionGraph 布局共享类型
 */

import type { ReligionNode, ReligionEdge } from '@/services/religion';

export interface D3Node extends ReligionNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface D3Edge {
  id: string;
  source: D3Node | string;
  target: D3Node | string;
  relationship: ReligionEdge['relationship'];
  description?: string;
  bidirectional?: boolean;
}

export interface LayoutContext {
  nodes: D3Node[];
  edges: D3Edge[];
  width: number;
  height: number;
  onNodeClick: (node: D3Node | null) => void;
}

/**
 * 节点半径（力导向 / 默认尺寸）
 */
export const nodeRadius = (d: D3Node): number => (d.type === 'sect' ? 30 : 20);
