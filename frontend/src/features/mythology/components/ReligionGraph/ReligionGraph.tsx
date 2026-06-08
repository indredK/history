/**
 * 宗教关系图组件
 * Religion Relationship Graph Component
 *
 * Requirements: 5.1, 5.2, 5.4, 5.5, 5.6, 5.7
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import * as d3 from 'd3';
import { useRequest } from 'ahooks';
import { StateView } from '@/components/ui';
import { useReligionStore } from '@/store/religionStore';
import { getReligionGraphData } from '@/services/religion';
import { FilterControls } from './FilterControls';
import { SearchBar } from './SearchBar';
import { NodePanel } from './NodePanel';
import { ViewModeToggle } from './ViewModeToggle';
import { useFilteredGraph } from './hooks/useFilteredGraph';
import { renderTreeLayout } from './layouts/treeLayout';
import { renderForceLayout } from './layouts/forceLayout';
import type { D3Node, D3Edge } from './layouts/types';
import './ReligionGraph.scss';

interface ReligionGraphProps {
  width?: number;
  height?: number;
}

/**
 * 宗教关系图组件
 * 使用 D3.js 实现力导向图布局，按视图模式切换树/力导向布局
 */
export function ReligionGraph({ width: propWidth, height: propHeight }: ReligionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: propWidth || 800,
    height: propHeight || 600,
  });

  const graphData = useReligionStore((state) => state.graphData);
  const setGraphData = useReligionStore((state) => state.setGraphData);
  const selectedNode = useReligionStore((state) => state.selectedNode);
  const setSelectedNode = useReligionStore((state) => state.setSelectedNode);
  const highlightedNodes = useReligionStore((state) => state.highlightedNodes);
  const selectedSects = useReligionStore((state) => state.selectedSects);
  const searchQuery = useReligionStore((state) => state.searchQuery);
  const viewMode = useReligionStore((state) => state.viewMode);
  const getRelatedNodesAndEdges = useReligionStore((state) => state.getRelatedNodesAndEdges);

  const { filteredNodes, filteredEdges } = useFilteredGraph(graphData, selectedSects, searchQuery);

  // 获取数据
  const { loading, error } = useRequest(
    async () => {
      const result = await getReligionGraphData();
      if (!result.success) {
        throw new Error(result.message || '获取数据失败');
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

    const resizeObserver = new ResizeObserver((entries) => {
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

  // 渲染图表
  useEffect(() => {
    if (!svgRef.current || !graphData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (filteredNodes.length === 0) return;

    // 深拷贝避免 d3 修改原数据
    const nodes: D3Node[] = filteredNodes.map((n) => ({ ...n }));
    const edges: D3Edge[] = filteredEdges.map((e) => ({ ...e }));

    // 创建缩放行为
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    const container = svg.append('g');

    // 添加箭头标记
    svg
      .append('defs')
      .append('marker')
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

    const ctx = {
      nodes,
      edges,
      width: dimensions.width,
      height: dimensions.height,
      onNodeClick: setSelectedNode,
    };

    if (viewMode === 'tree') {
      renderTreeLayout(svg, container, zoom, ctx);
      return;
    }

    const cleanup = renderForceLayout(svg, container, zoom, ctx);
    return cleanup;
  }, [graphData, dimensions, filteredNodes, filteredEdges, setSelectedNode, viewMode]);

  // 搜索高亮 —— 不重新渲染整个图表，仅调整透明度
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const hasHighlights = highlightedNodes.size > 0;

    svg
      .selectAll<SVGGElement, D3Node>('.node-group')
      .select('circle')
      .attr('opacity', (d) => (!hasHighlights || highlightedNodes.has(d.id) ? 1 : 0.3))
      .attr('stroke-width', (d) => (hasHighlights && highlightedNodes.has(d.id) ? 4 : 2));

    svg
      .selectAll<SVGGElement, D3Node>('.node-group')
      .select('.node-label')
      .attr('opacity', (d) => (!hasHighlights || highlightedNodes.has(d.id) ? 1 : 0.3));
  }, [highlightedNodes]);

  // 处理关闭详情面板
  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // 获取选中节点的相关信息
  const relatedInfo = selectedNode
    ? getRelatedNodesAndEdges(selectedNode.id)
    : { nodes: [], edges: [] };

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
        sx={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="religion-graph-svg"
        />
        {graphData && filteredNodes.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <StateView
              mode="empty"
              title="没有匹配的节点"
              description="请调整门派筛选或搜索关键词"
              minHeight="100%"
            />
          </Box>
        )}
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
