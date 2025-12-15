// 主要组件导出
export { D3Timeline } from './components/D3Timeline';
export { TimelineChart } from './components/TimelineChart';
export { EventDetailPanel } from './components/EventDetailPanel';

// 类型导出
export type { 
  TimelineChartRef, 
  TimelineChartProps, 
  LabelLayout, 
  YearLayout,
  TimelineConfig 
} from './types';

// 配置导出
export { TIMELINE_CONFIG } from './config/timelineConfig';

// 工具函数导出
export { calculateLabelLayout, calculateYearLayout } from './utils/layoutAlgorithms';
export { TimelineRenderer } from './utils/timelineRenderer';