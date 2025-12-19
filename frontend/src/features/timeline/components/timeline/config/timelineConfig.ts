import * as d3 from 'd3';
import type { TimelineConfig } from '../types';

// 时间轴配置
export const TIMELINE_CONFIG: TimelineConfig = {
  // 尺寸配置
  dimensions: {
    height: 400,
    margin: { top: 60, right: 40, bottom: 80, left: 40 }
  },
  
  // 样式配置
  styles: {
    mainLine: {
      stroke: 'url(#timeline-gradient)',
      strokeWidth: 2,
      filter: 'drop-shadow(0 1px 2px rgba(99,102,241,0.2))'
    },
    shadow: {
      stroke: 'rgba(99, 102, 241, 0.12)',
      strokeWidth: 2,
      offset: 1
    },
    axis: {
      domain: {
        stroke: 'rgba(71, 85, 105, 0.3)',
        strokeWidth: 1.5
      },
      tick: {
        stroke: 'rgba(71, 85, 105, 0.25)',
        strokeWidth: 1.5,
        size: 8
      },
      text: {
        fontSize: '12px',
        fontWeight: '500',
        fill: 'rgba(51, 65, 85, 0.8)',
        y: 12
      }
    }
  },
  
  // 事件样式配置
  event: {
    dot: {
      radius: 5,
      hoverRadius: 8,
      strokeWidth: 1.5,
      colors: {
        normal: '#6366f1',
        favorite: '#f59e0b',
        stroke: '#fff'
      }
    },
    span: {
      strokeWidth: 6,
      stroke: '#8b5cf6',
      opacity: 0.7
    },
    tick: {
      normal: {
        stroke: 'rgba(99, 102, 241, 0.7)',
        strokeWidth: 1.5
      },
      favorite: {
        stroke: 'rgba(245, 158, 11, 0.9)',
        strokeWidth: 2.5
      },
      shadow: {
        normal: 'rgba(99, 102, 241, 0.15)',
        favorite: 'rgba(245, 158, 11, 0.2)'
      }
    }
  },
  
  // 标签样式配置
  label: {
    event: {
      background: {
        normal: 'rgba(248, 250, 252, 0.95)',
        favorite: 'rgba(254, 243, 199, 0.95)',
        hover: {
          normal: 'rgba(241, 245, 249, 0.98)',
          favorite: 'rgba(253, 230, 138, 0.98)'
        },
        stroke: {
          normal: 'rgba(99, 102, 241, 0.2)',
          favorite: 'rgba(245, 158, 11, 0.4)'
        },
        rx: 10,
        ry: 10,
        padding: 8
      },
      text: {
        fontSize: '10px',
        fontWeight: '500',
        fill: {
          normal: '#334155',
          favorite: '#92400e'
        }
      },
      shadow: {
        fill: 'rgba(99, 102, 241, 0.08)',
        offset: { x: 1, y: 1 }
      }
    },
    year: {
      background: {
        normal: 'rgba(248, 250, 252, 0.9)',
        favorite: 'rgba(254, 243, 199, 0.9)',
        stroke: {
          normal: 'rgba(71, 85, 105, 0.2)',
          favorite: 'rgba(245, 158, 11, 0.3)'
        },
        rx: 6,
        ry: 6,
        height: 14
      },
      text: {
        fontSize: '8px',
        fontWeight: '500',
        fill: {
          normal: '#475569',
          favorite: '#a16207'
        }
      }
    }
  },
  
  // 布局配置
  layout: {
    minDistance: 40,
    maxLevels: 6,
    levelSpacing: 25,
    yearMinDistance: 30
  },
  
  // 缩放配置
  zoom: {
    scaleExtent: [0.1, 10],
    factor: {
      in: 0.8,
      out: 1.2
    }
  },
  
  // 滚动配置
  pan: {
    factor: 0.2, // 每次滚动移动当前视图范围的20%
    minStep: 50   // 最小滚动步长（年）
  }
};

// 渐变定义
export const createTimelineGradient = (defs: d3.Selection<SVGDefsElement, unknown, null, undefined>) => {
  const gradient = defs.append('linearGradient')
    .attr('id', 'timeline-gradient')
    .attr('x1', '0%')
    .attr('x2', '100%');
  
  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', 'rgba(99, 102, 241, 0.3)');
  
  gradient.append('stop')
    .attr('offset', '50%')
    .attr('stop-color', 'rgba(99, 102, 241, 0.8)');
  
  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'rgba(99, 102, 241, 0.3)');
};