import React from 'react';

// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 标记性能开始点
  mark(name: string): void {
    performance.mark(`${name}-start`);
    this.metrics.set(`${name}-start`, performance.now());
  }

  // 测量性能
  measure(name: string): number {
    const startTime = this.metrics.get(`${name}-start`);
    if (!startTime) {
      console.warn(`Performance mark ${name}-start not found`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    this.metrics.set(name, duration);
    return duration;
  }

  // 获取所有指标
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // 报告核心 Web Vitals
  reportWebVitals(): void {
    if ('web-vital' in window) {
      // 这里可以集成 web-vitals 库
      console.log('Web Vitals reporting enabled');
    }
  }
}

// 组件性能 HOC
export function withPerformanceTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const monitor = PerformanceMonitor.getInstance();
    
    React.useEffect(() => {
      monitor.mark(`${componentName}-render`);
      return () => {
        const duration = monitor.measure(`${componentName}-render`);
        if (duration > 100) { // 超过 100ms 记录警告
          console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
        }
      };
    });

    return React.createElement(WrappedComponent, props);
  };
}