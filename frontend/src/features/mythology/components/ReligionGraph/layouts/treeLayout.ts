/**
 * 树状图布局 —— 按门派组织的层级关系
 */

import * as d3 from 'd3';
import { NODE_COLORS, SECT_COLORS } from '@/services/religion/types';
import type { D3Node, D3Edge, LayoutContext } from './types';

const SECT_ROOTS: { [key: string]: string[] } = {
  '阐教': ['yuanshi'],
  '截教': ['lingbao'],
  '人教': ['taishang'],
  '西方教': ['jieyin', 'zhunti'],
  '天庭': ['yudi'],
  '佛门': ['rulai'],
};

interface TreeDatum {
  id: string;
  name: string;
  type: D3Node['type'];
  description: string;
  sect?: string;
  title?: string;
  children: TreeDatum[];
}

function buildTree(
  node: D3Node,
  allNodes: D3Node[],
  allEdges: D3Edge[],
  visited: Set<string>
): TreeDatum | null {
  if (visited.has(node.id)) return null;
  visited.add(node.id);

  const childEdges = allEdges.filter((e) => {
    const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
    return sourceId === node.id && ['师徒', '从属'].includes(e.relationship);
  });

  const children: TreeDatum[] = [];
  childEdges.forEach((e) => {
    const targetId = typeof e.target === 'string' ? e.target : e.target.id;
    const childNode = allNodes.find((n) => n.id === targetId);
    if (childNode && !visited.has(childNode.id) && childNode.type !== 'sect') {
      const childTree = buildTree(childNode, allNodes, allEdges, visited);
      if (childTree) children.push(childTree);
    }
  });

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    description: node.description,
    ...(node.sect ? { sect: node.sect } : {}),
    ...(node.title ? { title: node.title } : {}),
    children,
  };
}

/**
 * 渲染树状图布局
 */
export function renderTreeLayout(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
  ctx: LayoutContext
): void {
  const { nodes, edges, width, height, onNodeClick } = ctx;

  // ===== 1. 构建按门派组织的层级数据 =====
  const sectTrees: TreeDatum[] = [];
  const globalVisited = new Set<string>();

  Object.entries(SECT_ROOTS).forEach(([sectName, rootIds]) => {
    const sectChildren: TreeDatum[] = [];

    rootIds.forEach((rootId) => {
      const rootNode = nodes.find((n) => n.id === rootId);
      if (rootNode && !globalVisited.has(rootId)) {
        const tree = buildTree(rootNode, nodes, edges, globalVisited);
        if (tree) sectChildren.push(tree);
      }
    });

    if (sectChildren.length > 0) {
      sectTrees.push({
        id: `sect_${sectName}`,
        name: sectName,
        type: 'sect',
        description: `${sectName}门派`,
        children: sectChildren,
      });
    }
  });

  // 收容未被涉及到的散点
  const unvisitedNodes = nodes.filter((n) => !globalVisited.has(n.id) && n.type !== 'sect');
  const unvisitedBySect: { [key: string]: D3Node[] } = {};

  unvisitedNodes.forEach((node) => {
    const sect = node.sect || '其他';
    if (!unvisitedBySect[sect]) unvisitedBySect[sect] = [];
    unvisitedBySect[sect].push(node);
  });

  Object.entries(unvisitedBySect).forEach(([sect, nodeList]) => {
    const existingSect = sectTrees.find((s) => s.name === sect);
    const toTreeDatum = (n: D3Node): TreeDatum => ({
      id: n.id,
      name: n.name,
      type: n.type,
      description: n.description,
      ...(n.sect ? { sect: n.sect } : {}),
      ...(n.title ? { title: n.title } : {}),
      children: [],
    });
    if (existingSect) {
      nodeList.forEach((node) => existingSect.children.push(toTreeDatum(node)));
    } else if (nodeList.length > 0) {
      sectTrees.push({
        id: `sect_${sect}`,
        name: sect,
        type: 'sect',
        description: `${sect}`,
        children: nodeList.map(toTreeDatum),
      });
    }
  });

  const hierarchyData: TreeDatum = {
    id: 'root',
    name: '三界',
    type: 'sect',
    description: '道生一，一生二，二生三，三生万物',
    children: sectTrees,
  };

  // ===== 2. 树布局 =====
  const treeLayout = d3
    .tree<TreeDatum>()
    .size([height * 2.5, width * 2])
    .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.8));

  const root = d3.hierarchy(hierarchyData);
  treeLayout(root);

  // 计算居中变换
  const descendants = root.descendants().filter((d) => d.data.id !== 'root');
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  descendants.forEach((d) => {
    minX = Math.min(minX, d.x || 0);
    maxX = Math.max(maxX, d.x || 0);
    minY = Math.min(minY, d.y || 0);
    maxY = Math.max(maxY, d.y || 0);
  });

  const treeWidth = maxY - minY + 200;
  const treeHeight = maxX - minX + 100;
  const centerX = (minY + maxY) / 2;
  const centerY = (minX + maxX) / 2;

  const scaleX = width / treeWidth;
  const scaleY = height / treeHeight;
  const scale = Math.min(scaleX, scaleY, 0.8) * 0.9;

  const initialTransform = d3.zoomIdentity
    .translate(width / 2 - centerX * scale, height / 2 - centerY * scale)
    .scale(scale);
  svg.call(zoom.transform, initialTransform);

  // ===== 3. 绘制 =====
  const treeNodeRadius = (d: TreeDatum) => (d.type === 'sect' ? 18 : 10);

  container
    .append('g')
    .attr('class', 'links')
    .selectAll<SVGPathElement, d3.HierarchyPointLink<TreeDatum>>('path')
    .data(root.links().filter((l) => l.source.data.id !== 'root') as d3.HierarchyPointLink<TreeDatum>[])
    .join('path')
    .attr('class', 'tree-link')
    .attr('fill', 'none')
    .attr('stroke', '#666')
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.5)
    .attr(
      'd',
      d3
        .linkHorizontal<
          unknown,
          d3.HierarchyPointLink<TreeDatum>,
          d3.HierarchyPointNode<TreeDatum>
        >()
        .x((d) => d.y)
        .y((d) => d.x)
    );

  const node = container
    .append('g')
    .attr('class', 'nodes')
    .selectAll<SVGGElement, d3.HierarchyPointNode<TreeDatum>>('g')
    .data(root.descendants().filter((d) => d.data.id !== 'root') as d3.HierarchyPointNode<TreeDatum>[])
    .join('g')
    .attr('class', 'node-group')
    .attr('transform', (d) => `translate(${d.y},${d.x})`);

  node
    .append('circle')
    .attr('class', 'node-hit-area')
    .attr('r', (d) => treeNodeRadius(d.data) + 8)
    .attr('fill', 'transparent')
    .attr('stroke', 'none');

  node
    .append('circle')
    .attr('class', 'node')
    .attr('r', (d) => treeNodeRadius(d.data))
    .attr('fill', (d) => {
      const data = d.data;
      if (data.sect && SECT_COLORS[data.sect as keyof typeof SECT_COLORS]) {
        return SECT_COLORS[data.sect as keyof typeof SECT_COLORS]!;
      }
      return NODE_COLORS[data.type]?.fill || '#999';
    })
    .attr('stroke', (d) => NODE_COLORS[d.data.type]?.stroke || '#666')
    .attr('stroke-width', 1.5)
    .style('pointer-events', 'none');

  node
    .append('text')
    .attr('class', 'node-label')
    .attr('text-anchor', 'start')
    .attr('x', (d) => treeNodeRadius(d.data) + 5)
    .attr('dy', '0.35em')
    .attr('font-size', '11px')
    .attr('fill', 'var(--color-text-primary)')
    .text((d) => d.data.name);

  node
    .on('mouseenter', function () {
      d3.select(this).select('.node').attr('stroke-width', 3);
    })
    .on('mouseleave', function () {
      d3.select(this).select('.node').attr('stroke-width', 1.5);
    })
    .on('click', (event: MouseEvent, d) => {
      event.stopPropagation();
      const originalNode = nodes.find((n) => n.id === d.data.id);
      if (originalNode) onNodeClick(originalNode);
    });

  svg.on('click', () => onNodeClick(null));
}
