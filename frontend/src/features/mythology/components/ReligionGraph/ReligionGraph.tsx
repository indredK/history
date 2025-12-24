/**
 * 宗教关系图组件
 * Religion Relationship Graph Component
 * 
 * Requirements: 5.1, 5.2, 5.4, 5.5, 5.6, 5.7
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import * as d3 from 'd3';
import { useRequest } from 'ahooks';
import { useReligionStore } from '@/store/religionStore';
import { getReligionGraphData } from '@/services/religion';
import type { ReligionNode, ReligionEdge } from '@/services/religion';
import { NODE_COLORS, SECT_COLORS, RELATIONSHIP_COLORS } from '@/services/religion/types';
import { FilterControls } from './FilterControls';
import { SearchBar } from './SearchBar';
import { NodePanel } from './NodePanel';
import { ViewModeToggle } from './ViewModeToggle';
import './ReligionGraph.css';

interface ReligionGraphProps {
  width?: number;
  height?: number;
}

// D3 节点类型扩展
interface D3Node extends ReligionNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Edge {
  id: string;
  source: D3Node | string;
  target: D3Node | string;
  relationship: ReligionEdge['relationship'];
  description?: string;
  bidirectional?: boolean;
}

/**
 * 宗教关系图组件
 * 使用 D3.js 实现力导向图布局
 */
export function ReligionGraph({ width: propWidth, height: propHeight }: ReligionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: propWidth || 800, height: propHeight || 600 });
  
  const graphData = useReligionStore(state => state.graphData);
  const setGraphData = useReligionStore(state => state.setGraphData);
  const selectedNode = useReligionStore(state => state.selectedNode);
  const setSelectedNode = useReligionStore(state => state.setSelectedNode);
  const highlightedNodes = useReligionStore(state => state.highlightedNodes);
  const selectedSects = useReligionStore(state => state.selectedSects);
  const searchQuery = useReligionStore(state => state.searchQuery);
  const viewMode = useReligionStore(state => state.viewMode);
  const getRelatedNodesAndEdges = useReligionStore(state => state.getRelatedNodesAndEdges);
  
  // 计算筛选后的节点和边 - 使用 useMemo 避免不必要的重新计算
  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (!graphData) return { filteredNodes: [], filteredEdges: [] };
    
    let nodes = graphData.nodes;
    
    // 按门派筛选
    if (selectedSects.length > 0) {
      nodes = nodes.filter(node => {
        if (node.type === 'sect') {
          return selectedSects.some(sect => node.name === sect || node.id.includes(sect.toLowerCase()));
        }
        return node.sect && selectedSects.includes(node.sect);
      });
    }
    
    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      nodes = nodes.filter(node =>
        node.name.toLowerCase().includes(normalizedQuery) ||
        node.title?.toLowerCase().includes(normalizedQuery) ||
        node.description.toLowerCase().includes(normalizedQuery)
      );
    }
    
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = graphData.edges.filter(edge =>
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    
    return { filteredNodes: nodes, filteredEdges: edges };
  }, [graphData, selectedSects, searchQuery]);

  // 获取数据
  const { loading, error } = useRequest(
    async () => {
      const result = await getReligionGraphData();
      if (!result.success) {
        throw new Error((result as any).message || '获取数据失败');
      }
      return result.data!;
    },
    {
      cacheKey: 'religionGraph',
      onSuccess: (data) => setGraphData(data),
    }
  );

  // 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 渲染图表 - 只在数据或尺寸变化时重新渲染
  useEffect(() => {
    if (!svgRef.current || !graphData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    if (filteredNodes.length === 0) return;

    // 创建节点和边的副本
    const nodes: D3Node[] = filteredNodes.map(n => ({ ...n }));
    const edges: D3Edge[] = filteredEdges.map(e => ({ ...e }));

    // 创建缩放行为
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // 创建容器
    const container = svg.append('g');

    // 添加箭头标记
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#999');

    // 节点半径函数
    const nodeRadius = (d: D3Node) => d.type === 'sect' ? 30 : 20;

    // 根据视图模式选择布局
    if (viewMode === 'tree') {
      // ============ 树状图布局 ============
      // 构建层级数据 - 按门派组织
      
      // 定义门派根节点和其教主
      const sectRoots: { [key: string]: string[] } = {
        '阐教': ['yuanshi'],
        '截教': ['lingbao'],
        '人教': ['taishang'],
        '西方教': ['jieyin', 'zhunti'],
        '天庭': ['yudi'],
        '佛门': ['rulai'],
      };

      // 构建树的函数 - 支持多种关系类型
      function buildTree(node: D3Node, allNodes: D3Node[], allEdges: D3Edge[], visited = new Set<string>()): any {
        if (visited.has(node.id)) return null;
        visited.add(node.id);

        // 找到所有从该节点出发的层级关系（师徒、从属）
        const childEdges = allEdges.filter(e => {
          const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
          return sourceId === node.id && ['师徒', '从属'].includes(e.relationship);
        });

        const children: any[] = [];
        childEdges.forEach(e => {
          const targetId = typeof e.target === 'string' ? e.target : e.target.id;
          const childNode = allNodes.find(n => n.id === targetId);
          // 排除门派节点作为子节点
          if (childNode && !visited.has(childNode.id) && childNode.type !== 'sect') {
            const childTree = buildTree(childNode, allNodes, allEdges, visited);
            if (childTree) children.push(childTree);
          }
        });

        return { ...node, children };
      }

      // 为每个门派构建子树
      const sectTrees: any[] = [];
      const globalVisited = new Set<string>();

      Object.entries(sectRoots).forEach(([sectName, rootIds]) => {
        const sectChildren: any[] = [];
        
        rootIds.forEach(rootId => {
          const rootNode = nodes.find(n => n.id === rootId);
          if (rootNode && !globalVisited.has(rootId)) {
            const tree = buildTree(rootNode, nodes, edges, globalVisited);
            if (tree) sectChildren.push(tree);
          }
        });

        if (sectChildren.length > 0) {
          sectTrees.push({
            id: `sect_${sectName}`,
            name: sectName,
            type: 'sect' as const,
            description: `${sectName}门派`,
            children: sectChildren,
          });
        }
      });

      // 找出未被包含的节点，按门派分组
      const unvisitedNodes = nodes.filter(n => !globalVisited.has(n.id) && n.type !== 'sect');
      const unvisitedBySect: { [key: string]: D3Node[] } = {};
      
      unvisitedNodes.forEach(node => {
        const sect = node.sect || '其他';
        if (!unvisitedBySect[sect]) unvisitedBySect[sect] = [];
        unvisitedBySect[sect].push(node);
      });

      // 将未访问的节点添加到对应门派
      Object.entries(unvisitedBySect).forEach(([sect, nodeList]) => {
        const existingSect = sectTrees.find(s => s.name === sect);
        if (existingSect) {
          nodeList.forEach(node => {
            existingSect.children.push({ ...node, children: [] });
          });
        } else if (nodeList.length > 0) {
          sectTrees.push({
            id: `sect_${sect}`,
            name: sect,
            type: 'sect' as const,
            description: `${sect}`,
            children: nodeList.map(n => ({ ...n, children: [] })),
          });
        }
      });

      // 创建虚拟根节点
      const hierarchyData = {
        id: 'root',
        name: '三界',
        type: 'sect' as const,
        description: '道生一，一生二，二生三，三生万物',
        children: sectTrees,
      };

      // 创建树布局
      const treeLayout = d3.tree<any>()
        .size([height * 2.5, width * 2])
        .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.8));

      const root = d3.hierarchy(hierarchyData);
      treeLayout(root);

      // 计算树的边界并居中
      const descendants = root.descendants().filter(d => d.data.id !== 'root');
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      descendants.forEach(d => {
        minX = Math.min(minX, d.x || 0);
        maxX = Math.max(maxX, d.x || 0);
        minY = Math.min(minY, d.y || 0);
        maxY = Math.max(maxY, d.y || 0);
      });

      const treeWidth = maxY - minY + 200;
      const treeHeight = maxX - minX + 100;
      const centerX = (minY + maxY) / 2;
      const centerY = (minX + maxX) / 2;
      
      // 计算合适的缩放比例
      const scaleX = width / treeWidth;
      const scaleY = height / treeHeight;
      const scale = Math.min(scaleX, scaleY, 0.8) * 0.9;
      
      // 应用居中变换
      const initialTransform = d3.zoomIdentity
        .translate(width / 2 - centerX * scale, height / 2 - centerY * scale)
        .scale(scale);
      svg.call(zoom.transform, initialTransform);

      // 树状图专用的节点半径 - 更小
      const treeNodeRadius = (d: D3Node) => d.type === 'sect' ? 18 : 10;

      // 绘制连接线
      container.append('g')
        .attr('class', 'links')
        .selectAll('path')
        .data(root.links().filter(l => l.source.data.id !== 'root'))
        .join('path')
        .attr('class', 'tree-link')
        .attr('fill', 'none')
        .attr('stroke', '#666')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.5)
        .attr('d', d3.linkHorizontal<any, any>()
          .x(d => d.y)
          .y(d => d.x));

      // 绘制节点
      const node = container.append('g')
        .attr('class', 'nodes')
        .selectAll<SVGGElement, any>('g')
        .data(root.descendants().filter(d => d.data.id !== 'root'))
        .join('g')
        .attr('class', 'node-group')
        .attr('transform', d => `translate(${d.y},${d.x})`);

      // 节点圆形
      node.append('circle')
        .attr('class', 'node-hit-area')
        .attr('r', d => treeNodeRadius(d.data as D3Node) + 8)
        .attr('fill', 'transparent')
        .attr('stroke', 'none');

      node.append('circle')
        .attr('class', 'node')
        .attr('r', d => treeNodeRadius(d.data as D3Node))
        .attr('fill', d => {
          const nodeData = d.data as D3Node;
          if (nodeData.sect && SECT_COLORS[nodeData.sect]) {
            return SECT_COLORS[nodeData.sect];
          }
          return NODE_COLORS[nodeData.type]?.fill || '#999';
        })
        .attr('stroke', d => NODE_COLORS[(d.data as D3Node).type]?.stroke || '#666')
        .attr('stroke-width', 1.5)
        .style('pointer-events', 'none');

      // 节点标签 - 放在节点右侧
      node.append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'start')
        .attr('x', d => treeNodeRadius(d.data as D3Node) + 5)
        .attr('dy', '0.35em')
        .attr('font-size', '11px')
        .attr('fill', 'var(--color-text-primary)')
        .text(d => (d.data as D3Node).name);

      // 节点交互
      node
        .on('mouseenter', function() {
          d3.select(this).select('.node').attr('stroke-width', 3);
        })
        .on('mouseleave', function() {
          d3.select(this).select('.node').attr('stroke-width', 1.5);
        })
        .on('click', (event: MouseEvent, d: any) => {
          event.stopPropagation();
          const originalNode = nodes.find(n => n.id === d.data.id);
          if (originalNode) setSelectedNode(originalNode);
        });

      // 点击空白处取消选中
      svg.on('click', () => setSelectedNode(null));

      return;
    }

    // ============ 力导向图布局 ============
    // 初始居中
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.6);
    svg.call(zoom.transform, initialTransform);

    // 创建力导向模拟
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Edge>(edges)
        .id(d => d.id)
        .distance(200)
        .strength(0.3))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(60));

    // 绘制边
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('g')
      .data(edges)
      .join('g')
      .attr('class', 'link-group');

    link.append('line')
      .attr('class', 'link')
      .attr('stroke', d => RELATIONSHIP_COLORS[d.relationship] || '#999')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    link.append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .attr('font-size', '10px')
      .attr('fill', 'var(--color-text-secondary)')
      .text(d => d.relationship);

    // 绘制节点
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, D3Node>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node-group')
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as unknown as (selection: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>) => void);

    node.append('circle')
      .attr('class', 'node-hit-area')
      .attr('r', d => nodeRadius(d) + 10)
      .attr('fill', 'transparent')
      .attr('stroke', 'none');

    node.append('circle')
      .attr('class', 'node')
      .attr('r', nodeRadius)
      .attr('fill', d => {
        if (d.sect && SECT_COLORS[d.sect]) {
          return SECT_COLORS[d.sect];
        }
        return NODE_COLORS[d.type]?.fill || '#999';
      })
      .attr('stroke', d => NODE_COLORS[d.type]?.stroke || '#666')
      .attr('stroke-width', 2)
      .style('pointer-events', 'none');

    node.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => nodeRadius(d) + 15)
      .attr('font-size', '12px')
      .attr('fill', 'var(--color-text-primary)')
      .text(d => d.name);

    // 节点交互
    node
      .on('mouseenter', (_event: MouseEvent, d: D3Node) => {
        const relatedNodeIds = new Set<string>([d.id]);
        const relatedEdgeIds = new Set<string>();
        
        edges.forEach(edge => {
          const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
          const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
          if (sourceId === d.id || targetId === d.id) {
            relatedEdgeIds.add(edge.id);
            relatedNodeIds.add(sourceId);
            relatedNodeIds.add(targetId);
          }
        });
        
        node.select('.node')
          .attr('opacity', n => relatedNodeIds.has(n.id) ? 1 : 0.3)
          .attr('stroke-width', n => relatedNodeIds.has(n.id) ? 4 : 2);
        
        node.select('.node-label')
          .attr('opacity', n => relatedNodeIds.has(n.id) ? 1 : 0.3);
        
        link.select('line')
          .attr('stroke-opacity', e => relatedEdgeIds.has(e.id) ? 1 : 0.1)
          .attr('stroke-width', e => relatedEdgeIds.has(e.id) ? 3 : 2);
        
        link.select('text')
          .attr('opacity', e => relatedEdgeIds.has(e.id) ? 1 : 0.2);
      })
      .on('mouseleave', () => {
        node.select('.node')
          .attr('opacity', 1)
          .attr('stroke-width', 2);
        
        node.select('.node-label')
          .attr('opacity', 1);
        
        link.select('line')
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', 2);
        
        link.select('text')
          .attr('opacity', 1);
      })
      .on('click', (event: MouseEvent, d: D3Node) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    svg.on('click', () => setSelectedNode(null));

    // 力导向模拟更新
    simulation.on('tick', () => {
      link.select('line')
        .attr('x1', d => (d.source as D3Node).x || 0)
        .attr('y1', d => (d.source as D3Node).y || 0)
        .attr('x2', d => (d.target as D3Node).x || 0)
        .attr('y2', d => (d.target as D3Node).y || 0);

      link.select('text')
        .attr('x', d => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
        .attr('y', d => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // 模拟结束后自动居中
    simulation.on('end', () => {
      // 计算所有节点的边界
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach(n => {
        if (n.x !== undefined && n.y !== undefined) {
          minX = Math.min(minX, n.x);
          maxX = Math.max(maxX, n.x);
          minY = Math.min(minY, n.y);
          maxY = Math.max(maxY, n.y);
        }
      });

      // 计算中心点和缩放比例
      const graphWidth = maxX - minX + 100;
      const graphHeight = maxY - minY + 100;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      // 计算合适的缩放比例
      const scaleX = width / graphWidth;
      const scaleY = height / graphHeight;
      const scale = Math.min(scaleX, scaleY, 1) * 0.85; // 留一些边距
      
      // 应用居中变换
      const transform = d3.zoomIdentity
        .translate(width / 2 - centerX * scale, height / 2 - centerY * scale)
        .scale(scale);
      
      svg.transition()
        .duration(500)
        .call(zoom.transform, transform);
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

    return () => {
      simulation.stop();
    };
  }, [graphData, dimensions, filteredNodes, filteredEdges, setSelectedNode, viewMode]);
  
  // 单独处理搜索高亮 - 不重新渲染整个图表
  useEffect(() => {
    if (!svgRef.current || highlightedNodes.size === 0) return;
    
    const svg = d3.select(svgRef.current);
    
    // 更新节点高亮
    svg.selectAll<SVGGElement, D3Node>('.node-group')
      .select('circle')
      .attr('opacity', d => highlightedNodes.has(d.id) ? 1 : 0.3)
      .attr('stroke-width', d => highlightedNodes.has(d.id) ? 4 : 2);
    
    svg.selectAll<SVGGElement, D3Node>('.node-group')
      .select('.node-label')
      .attr('opacity', d => highlightedNodes.has(d.id) ? 1 : 0.3);
      
  }, [highlightedNodes]);

  // 处理关闭详情面板
  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // 获取选中节点的相关信息
  const relatedInfo = selectedNode ? getRelatedNodesAndEdges(selectedNode.id) : { nodes: [], edges: [] };

  if (loading) {
    return (
      <Box className="religion-graph-loading">
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>加载关系图数据...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="religion-graph-loading">
        <Typography color="error">加载失败: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box className="religion-graph-wrapper">
      {/* 工具栏 */}
      <Box className="religion-graph-toolbar">
        <FilterControls />
        <SearchBar />
        <ViewModeToggle />
      </Box>

      {/* 图表容器 */}
      <Box 
        ref={containerRef}
        className="religion-graph-container glass-card-dark"
        sx={{ width: '100%', height: '100%' }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="religion-graph-svg"
        />
      </Box>

      {/* 节点详情面板 */}
      <NodePanel
        node={selectedNode}
        onClose={handleClosePanel}
        relatedNodes={relatedInfo.nodes}
        relatedEdges={relatedInfo.edges}
      />
    </Box>
  );
}

export default ReligionGraph;
