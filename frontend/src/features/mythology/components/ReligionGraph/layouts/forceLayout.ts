/**
 * 力导向图布局
 */

import * as d3 from 'd3';
import { NODE_COLORS, SECT_COLORS, RELATIONSHIP_COLORS } from '@/services/religion/types';
import { type D3Node, type D3Edge, type LayoutContext, nodeRadius } from './types';

/**
 * 渲染力导向图布局，返回卸载函数
 */
export function renderForceLayout(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
  ctx: LayoutContext
): () => void {
  const { nodes, edges, width, height, onNodeClick } = ctx;

  // 初始居中
  const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(0.6);
  svg.call(zoom.transform, initialTransform);

  // 创建力导向模拟
  const simulation = d3
    .forceSimulation<D3Node>(nodes)
    .force(
      'link',
      d3
        .forceLink<D3Node, D3Edge>(edges)
        .id((d) => d.id)
        .distance(200)
        .strength(0.3)
    )
    .force('charge', d3.forceManyBody().strength(-800))
    .force('center', d3.forceCenter(0, 0))
    .force('collision', d3.forceCollide().radius(60));

  // 绘制边
  const link = container
    .append('g')
    .attr('class', 'links')
    .selectAll('g')
    .data(edges)
    .join('g')
    .attr('class', 'link-group');

  link
    .append('line')
    .attr('class', 'link')
    .attr('stroke', (d) => RELATIONSHIP_COLORS[d.relationship] || '#999')
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.6)
    .attr('marker-end', 'url(#arrowhead)');

  link
    .append('text')
    .attr('class', 'link-label')
    .attr('text-anchor', 'middle')
    .attr('dy', -5)
    .attr('font-size', '10px')
    .attr('fill', 'var(--color-text-secondary)')
    .text((d) => d.relationship);

  // 绘制节点
  const node = container
    .append('g')
    .attr('class', 'nodes')
    .selectAll<SVGGElement, D3Node>('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node-group')
    .call(
      d3
        .drag<SVGGElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as unknown as (
        selection: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>
      ) => void
    );

  node
    .append('circle')
    .attr('class', 'node-hit-area')
    .attr('r', (d) => nodeRadius(d) + 10)
    .attr('fill', 'transparent')
    .attr('stroke', 'none');

  node
    .append('circle')
    .attr('class', 'node')
    .attr('r', nodeRadius)
    .attr('fill', (d) => {
      if (d.sect && SECT_COLORS[d.sect as keyof typeof SECT_COLORS]) {
        return SECT_COLORS[d.sect as keyof typeof SECT_COLORS]!;
      }
      return NODE_COLORS[d.type]?.fill || '#999';
    })
    .attr('stroke', (d) => NODE_COLORS[d.type]?.stroke || '#666')
    .attr('stroke-width', 2)
    .style('pointer-events', 'none');

  node
    .append('text')
    .attr('class', 'node-label')
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => nodeRadius(d) + 15)
    .attr('font-size', '12px')
    .attr('fill', 'var(--color-text-primary)')
    .text((d) => d.name);

  // 节点交互
  node
    .on('mouseenter', (_event: MouseEvent, d: D3Node) => {
      const relatedNodeIds = new Set<string>([d.id]);
      const relatedEdgeIds = new Set<string>();

      edges.forEach((edge) => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        if (sourceId === d.id || targetId === d.id) {
          relatedEdgeIds.add(edge.id);
          relatedNodeIds.add(sourceId);
          relatedNodeIds.add(targetId);
        }
      });

      node
        .select<SVGCircleElement>('.node')
        .attr('opacity', (n: D3Node) => (relatedNodeIds.has(n.id) ? 1 : 0.3))
        .attr('stroke-width', (n: D3Node) => (relatedNodeIds.has(n.id) ? 4 : 2));

      node
        .select<SVGTextElement>('.node-label')
        .attr('opacity', (n: D3Node) => (relatedNodeIds.has(n.id) ? 1 : 0.3));

      link
        .select<SVGLineElement>('line')
        .attr('stroke-opacity', (e: D3Edge) => (relatedEdgeIds.has(e.id) ? 1 : 0.1))
        .attr('stroke-width', (e: D3Edge) => (relatedEdgeIds.has(e.id) ? 3 : 2));

      link
        .select<SVGTextElement>('text')
        .attr('opacity', (e: D3Edge) => (relatedEdgeIds.has(e.id) ? 1 : 0.2));
    })
    .on('mouseleave', () => {
      node.select('.node').attr('opacity', 1).attr('stroke-width', 2);
      node.select('.node-label').attr('opacity', 1);
      link.select('line').attr('stroke-opacity', 0.6).attr('stroke-width', 2);
      link.select('text').attr('opacity', 1);
    })
    .on('click', (event: MouseEvent, d: D3Node) => {
      event.stopPropagation();
      onNodeClick(d);
    });

  svg.on('click', () => onNodeClick(null));

  // tick & centering
  simulation.on('tick', () => {
    link
      .select('line')
      .attr('x1', (d) => (d.source as D3Node).x || 0)
      .attr('y1', (d) => (d.source as D3Node).y || 0)
      .attr('x2', (d) => (d.target as D3Node).x || 0)
      .attr('y2', (d) => (d.target as D3Node).y || 0);

    link
      .select('text')
      .attr('x', (d) => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
      .attr('y', (d) => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2);

    node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
  });

  simulation.on('end', () => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      if (n.x !== undefined && n.y !== undefined) {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
      }
    });

    const graphWidth = maxX - minX + 100;
    const graphHeight = maxY - minY + 100;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaleX = width / graphWidth;
    const scaleY = height / graphHeight;
    const scale = Math.min(scaleX, scaleY, 1) * 0.85;

    const transform = d3.zoomIdentity
      .translate(width / 2 - centerX * scale, height / 2 - centerY * scale)
      .scale(scale);

    svg.transition().duration(500).call(zoom.transform, transform);
  });

  // 拖拽函数
  function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x ?? null;
    d.fy = d.y ?? null;
  }
  function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return () => simulation.stop();
}
