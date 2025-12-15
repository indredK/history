import type { Event } from '../../../../../services/timeline/types';

// 标签布局接口
export interface LabelLayout {
  event: Event;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  priority: number;
}

// 年份布局接口
export interface YearLayout {
  event: Event;
  x: number;
  yearText: string;
  width: number;
  priority: number;
}

// 时间轴配置接口
export interface TimelineConfig {
  dimensions: {
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
  };
  styles: {
    mainLine: {
      stroke: string;
      strokeWidth: number;
      filter: string;
    };
    shadow: {
      stroke: string;
      strokeWidth: number;
      offset: number;
    };
    axis: {
      domain: { stroke: string; strokeWidth: number };
      tick: { stroke: string; strokeWidth: number; size: number };
      text: { fontSize: string; fontWeight: string; fill: string; y: number };
    };
  };
  event: {
    dot: {
      radius: number;
      hoverRadius: number;
      strokeWidth: number;
      colors: { normal: string; favorite: string; stroke: string };
    };
    span: { strokeWidth: number; stroke: string; opacity: number };
    tick: {
      normal: { stroke: string; strokeWidth: number };
      favorite: { stroke: string; strokeWidth: number };
      shadow: { normal: string; favorite: string };
    };
  };
  label: {
    event: {
      background: {
        normal: string;
        favorite: string;
        hover: { normal: string; favorite: string };
        stroke: { normal: string; favorite: string };
        rx: number;
        ry: number;
        padding: number;
      };
      text: {
        fontSize: string;
        fontWeight: string;
        fill: { normal: string; favorite: string };
      };
      shadow: { fill: string; offset: { x: number; y: number } };
    };
    year: {
      background: {
        normal: string;
        favorite: string;
        stroke: { normal: string; favorite: string };
        rx: number;
        ry: number;
        height: number;
      };
      text: {
        fontSize: string;
        fontWeight: string;
        fill: { normal: string; favorite: string };
      };
    };
  };
  layout: {
    minDistance: number;
    maxLevels: number;
    levelSpacing: number;
    yearMinDistance: number;
  };
  zoom: {
    scaleExtent: [number, number];
    factor: { in: number; out: number };
  };
  pan: {
    factor: number;
    minStep: number;
  };
}

// 时间轴引用接口
export interface TimelineChartRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  panLeft: () => void;
  panRight: () => void;
}

// 时间轴组件属性接口
export interface TimelineChartProps {
  events: Event[];
  favorites: string[];
  onZoomChange: (zoomLevel: number) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
}