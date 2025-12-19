import * as d3 from 'd3';
import type { Event } from '@/services/timeline/types';
import type { LabelLayout } from '../types';
import { TIMELINE_CONFIG, createTimelineGradient } from '../config/timelineConfig';
import { calculateLabelLayout, calculateYearLayout } from './layoutAlgorithms';

/**
 * 时间轴渲染器类
 * 负责所有D3.js相关的绘制逻辑
 */
export class TimelineRenderer {
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private width: number;
  private height: number;
  private xScale: d3.ScaleLinear<number, number>;
  private favorites: string[];

  constructor(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    width: number,
    height: number,
    xScale: d3.ScaleLinear<number, number>,
    favorites: string[]
  ) {
    this.g = g;
    this.width = width;
    this.height = height;
    this.xScale = xScale;
    this.favorites = favorites;
  }

  /**
   * 渲染时间轴主线
   */
  renderMainTimeline(): void {
    const { styles } = TIMELINE_CONFIG;
    
    // 创建渐变定义
    const defs = this.g.append('defs');
    createTimelineGradient(defs);

    // 绘制阴影
    this.g.append('line')
      .attr('class', 'timeline-shadow')
      .attr('x1', 0)
      .attr('x2', this.width)
      .attr('y1', this.height / 2 + styles.shadow.offset)
      .attr('y2', this.height / 2 + styles.shadow.offset)
      .attr('stroke', styles.shadow.stroke)
      .attr('stroke-width', styles.shadow.strokeWidth);

    // 绘制主线
    this.g.append('line')
      .attr('class', 'timeline-main')
      .attr('x1', 0)
      .attr('x2', this.width)
      .attr('y1', this.height / 2)
      .attr('y2', this.height / 2)
      .attr('stroke', styles.mainLine.stroke)
      .attr('stroke-width', styles.mainLine.strokeWidth)
      .style('filter', styles.mainLine.filter);
  }

  /**
   * 渲染标准时间轴
   */
  renderStandardAxis(): void {
    const { styles } = TIMELINE_CONFIG;
    
    const xAxis = d3.axisBottom(this.xScale)
      .tickFormat(d => `${d}年`)
      .ticks(Math.min(8, Math.floor(this.width / 120)))
      .tickSize(styles.axis.tick.size);

    const xAxisGroup = this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`);
    
    xAxisGroup.call(xAxis as any);
    
    // 样式化轴线
    xAxisGroup.select('.domain')
      .attr('stroke', styles.axis.domain.stroke)
      .attr('stroke-width', styles.axis.domain.strokeWidth);
    
    // 样式化刻度线
    xAxisGroup.selectAll('.tick line')
      .attr('stroke', styles.axis.tick.stroke)
      .attr('stroke-width', styles.axis.tick.strokeWidth);
    
    // 样式化文字
    xAxisGroup.selectAll('text')
      .style('font-size', styles.axis.text.fontSize)
      .style('font-weight', styles.axis.text.fontWeight)
      .style('fill', styles.axis.text.fill)
      .attr('y', styles.axis.text.y);
  }

  /**
   * 渲染事件点和跨度线
   */
  renderEvents(events: Event[], onEventSelect?: (event: Event) => void): void {
    const { event: eventConfig } = TIMELINE_CONFIG;
    
    const eventGroups = this.g.selectAll('.event-group')
      .data(events)
      .enter()
      .append('g')
      .attr('class', 'event-group')
      .attr('transform', d => `translate(${this.xScale(d.startYear)}, 0)`);

    // 绘制事件跨度线
    eventGroups
      .filter((d: Event) => Boolean(d.endYear && d.endYear !== d.startYear))
      .append('line')
      .attr('class', 'event-span')
      .attr('x1', 0)
      .attr('x2', (d: Event) => {
        const domain = this.xScale.domain();
        const endYear = d.endYear ?? d.startYear;
        const domainEnd = domain[1];
        const domainStart = domain[0];
        if (domainEnd === undefined || domainStart === undefined) return 0;
        return Math.max(0, this.xScale(Math.min(endYear, domainEnd)) - this.xScale(Math.max(d.startYear, domainStart)));
      })
      .attr('y1', this.height / 2)
      .attr('y2', this.height / 2)
      .attr('stroke', eventConfig.span.stroke)
      .attr('stroke-width', eventConfig.span.strokeWidth)
      .attr('opacity', eventConfig.span.opacity);

    // 绘制事件点
    eventGroups
      .append('circle')
      .attr('class', 'event-dot')
      .attr('cx', 0)
      .attr('cy', this.height / 2)
      .attr('r', eventConfig.dot.radius)
      .attr('fill', (d: Event) => this.favorites.includes(d.id) ? eventConfig.dot.colors.favorite : eventConfig.dot.colors.normal)
      .attr('stroke', eventConfig.dot.colors.stroke)
      .attr('stroke-width', eventConfig.dot.strokeWidth)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d: Event) => this.handleDotHover(event, d, true))
      .on('mouseout', (event, d: Event) => this.handleDotHover(event, d, false))
      .on('click', (_, d: Event) => onEventSelect?.(d));
  }

  /**
   * 处理事件点悬停
   */
  private handleDotHover(event: any, d: Event, isHover: boolean): void {
    const { event: eventConfig } = TIMELINE_CONFIG;
    const dot = d3.select(event.target);
    
    if (isHover) {
      dot.transition().duration(200).attr('r', eventConfig.dot.hoverRadius);
      this.showTooltip(d);
    } else {
      dot.transition().duration(200).attr('r', eventConfig.dot.radius);
      this.hideTooltip();
    }
  }

  /**
   * 显示tooltip
   */
  private showTooltip(event: Event): void {
    const tooltip = this.g.append('g')
      .attr('class', 'tooltip')
      .attr('transform', `translate(${this.xScale(event.startYear)}, ${this.height / 2 - 20})`);
    
    const rect = tooltip.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(0, 0, 0, 0.8)')
      .attr('stroke', '#ccc');
    
    const text = tooltip.append('text')
      .attr('fill', 'white')
      .attr('text-anchor', 'middle')
      .attr('dy', '-5')
      .style('font-size', '12px')
      .text(event.title);
    
    const bbox = text.node()?.getBBox();
    if (bbox) {
      rect.attr('x', bbox.x - 5)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 10)
        .attr('height', bbox.height + 4);
    }
  }

  /**
   * 隐藏tooltip
   */
  private hideTooltip(): void {
    this.g.select('.tooltip').remove();
  }

  /**
   * 渲染事件标签
   */
  renderEventLabels(events: Event[], currentZoom: number): void {
    const labelLayout = calculateLabelLayout(events, this.xScale, this.height, this.favorites, currentZoom);
    
    // 绘制连接线
    this.renderConnectorLines(labelLayout);
    
    // 绘制标签
    this.renderLabels(labelLayout);
  }

  /**
   * 渲染连接线
   */
  private renderConnectorLines(labelLayout: LabelLayout[]): void {
    labelLayout.forEach(label => {
      if (Math.abs(label.y - this.height / 2) > 20) {
        const lineGroup = this.g.append('g').attr('class', 'connector-group');
        
        lineGroup.append('line')
          .attr('class', 'label-connector')
          .attr('x1', label.x)
          .attr('y1', this.height / 2 + (label.y > this.height / 2 ? 5 : -5))
          .attr('x2', label.x)
          .attr('y2', label.y > this.height / 2 ? label.y - 12 : label.y + 12)
          .attr('stroke', this.favorites.includes(label.event.id) ? '#f59e0b' : '#6366f1')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3,2')
          .attr('opacity', 0.4)
          .style('filter', 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))');
      }
    });
  }

  /**
   * 渲染标签
   */
  private renderLabels(labelLayout: LabelLayout[]): void {
    const { label } = TIMELINE_CONFIG;
    
    const labelGroups = this.g.selectAll('.label-group')
      .data(labelLayout)
      .enter()
      .append('g')
      .attr('class', 'label-group')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // 先添加临时文字测量宽度
    const textElements = labelGroups
      .append('text')
      .attr('class', 'event-label-temp')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', label.event.text.fontSize)
      .style('font-weight', label.event.text.fontWeight)
      .style('opacity', 0)
      .text(d => d.event.title.length > 12 ? d.event.title.substring(0, 12) + '...' : d.event.title);

    // 添加阴影
    labelGroups
      .append('rect')
      .attr('class', 'label-shadow')
      .attr('x', (_, i) => {
        const textElement = textElements.nodes()[i] as SVGTextElement;
        const bbox = textElement.getBBox();
        return -bbox.width / 2 - label.event.background.padding + label.event.shadow.offset.x;
      })
      .attr('y', -12 + label.event.shadow.offset.y)
      .attr('width', (_, i) => {
        const textElement = textElements.nodes()[i] as SVGTextElement;
        const bbox = textElement.getBBox();
        return bbox.width + 16;
      })
      .attr('height', 24)
      .attr('rx', label.event.background.rx)
      .attr('ry', label.event.background.ry)
      .attr('fill', label.event.shadow.fill);

    // 添加背景
    labelGroups
      .append('rect')
      .attr('class', 'label-background')
      .attr('x', (_, i) => {
        const textElement = textElements.nodes()[i] as SVGTextElement;
        const bbox = textElement.getBBox();
        return -bbox.width / 2 - label.event.background.padding;
      })
      .attr('y', -12)
      .attr('width', (_, i) => {
        const textElement = textElements.nodes()[i] as SVGTextElement;
        const bbox = textElement.getBBox();
        return bbox.width + 16;
      })
      .attr('height', 24)
      .attr('rx', label.event.background.rx)
      .attr('ry', label.event.background.ry)
      .attr('fill', d => this.favorites.includes(d.event.id) ? 
        label.event.background.favorite : 
        label.event.background.normal)
      .attr('stroke', d => this.favorites.includes(d.event.id) ? 
        label.event.background.stroke.favorite : 
        label.event.background.stroke.normal)
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .on('mouseover', (event, d) => this.handleLabelHover(event, d, true))
      .on('mouseout', (event, d) => this.handleLabelHover(event, d, false));

    // 移除临时文字
    textElements.remove();

    // 添加收藏图标
    labelGroups
      .filter(d => this.favorites.includes(d.event.id))
      .append('circle')
      .attr('class', 'favorite-icon')
      .attr('cx', function() {
        const parentGroup = this.parentNode as SVGGElement;
        const bgRect = d3.select(parentGroup).select('.label-background').node() as SVGRectElement;
        const bgWidth = parseFloat(bgRect.getAttribute('width') || '0');
        return bgWidth / 2 - 8;
      })
      .attr('cy', -8)
      .attr('r', 3)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('pointer-events', 'none');

    // 添加最终文字
    labelGroups
      .append('text')
      .attr('class', 'event-label')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', label.event.text.fontSize)
      .style('font-weight', label.event.text.fontWeight)
      .style('fill', d => this.favorites.includes(d.event.id) ? 
        label.event.text.fill.favorite : 
        label.event.text.fill.normal)
      .style('cursor', 'pointer')
      .style('pointer-events', 'none')
      .text(d => d.event.title.length > 12 ? d.event.title.substring(0, 12) + '...' : d.event.title);
  }

  /**
   * 处理标签悬停
   */
  private handleLabelHover(event: any, d: LabelLayout, isHover: boolean): void {
    const { label } = TIMELINE_CONFIG;
    const rect = d3.select(event.target);
    
    if (isHover) {
      rect.transition().duration(200)
        .attr('stroke-width', 2)
        .attr('fill', this.favorites.includes(d.event.id) ? 
          label.event.background.hover.favorite : 
          label.event.background.hover.normal);
    } else {
      rect.transition().duration(200)
        .attr('stroke-width', 1.5)
        .attr('fill', this.favorites.includes(d.event.id) ? 
          label.event.background.favorite : 
          label.event.background.normal);
    }
  }

  /**
   * 渲染事件年份标签
   */
  renderEventYears(events: Event[], currentZoom: number): void {
    const yearLayout = calculateYearLayout(events, this.xScale, this.favorites, currentZoom);
    
    yearLayout.forEach(({ event, x, yearText }) => {
      const isFavorite = this.favorites.includes(event.id);
      const { event: eventConfig, label } = TIMELINE_CONFIG;
      
      // 绘制刻度线
      this.renderEventTick(x, isFavorite, eventConfig);
      
      // 绘制年份标签
      this.renderYearLabel(x, yearText, isFavorite, label.year);
    });
  }

  /**
   * 渲染事件刻度线
   */
  private renderEventTick(x: number, isFavorite: boolean, eventConfig: any): void {
    // 阴影
    this.g.append('line')
      .attr('class', 'event-tick-shadow')
      .attr('x1', x + 0.5)
      .attr('x2', x + 0.5)
      .attr('y1', this.height / 2 - 8)
      .attr('y2', this.height - 30)
      .attr('stroke', isFavorite ? eventConfig.tick.shadow.favorite : eventConfig.tick.shadow.normal)
      .attr('stroke-width', 1.5);
    
    // 主线
    this.g.append('line')
      .attr('class', 'event-tick')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', this.height / 2 - 8)
      .attr('y2', this.height - 30)
      .attr('stroke', isFavorite ? eventConfig.tick.favorite.stroke : eventConfig.tick.normal.stroke)
      .attr('stroke-width', isFavorite ? eventConfig.tick.favorite.strokeWidth : eventConfig.tick.normal.strokeWidth)
      .attr('stroke-linecap', 'round')
      .style('filter', 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))');
  }

  /**
   * 渲染年份标签
   */
  private renderYearLabel(x: number, yearText: string, isFavorite: boolean, yearConfig: any): void {
    const bgWidth = yearText.length * 6 + 8;
    
    // 背景
    this.g.append('rect')
      .attr('class', 'event-year-bg')
      .attr('x', x - bgWidth / 2)
      .attr('y', this.height - 25)
      .attr('width', bgWidth)
      .attr('height', yearConfig.background.height)
      .attr('rx', yearConfig.background.rx)
      .attr('ry', yearConfig.background.ry)
      .attr('fill', isFavorite ? yearConfig.background.favorite : yearConfig.background.normal)
      .attr('stroke', isFavorite ? yearConfig.background.stroke.favorite : yearConfig.background.stroke.normal)
      .attr('stroke-width', 0.8)
      .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))');
    
    // 文字
    this.g.append('text')
      .attr('class', 'event-year-text')
      .attr('x', x)
      .attr('y', this.height - 18)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', yearConfig.text.fontSize)
      .style('font-weight', yearConfig.text.fontWeight)
      .style('fill', isFavorite ? yearConfig.text.fill.favorite : yearConfig.text.fill.normal)
      .style('opacity', 0.9)
      .text(yearText);
  }
}