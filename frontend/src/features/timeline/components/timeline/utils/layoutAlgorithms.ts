import type { Event } from '@/services/timeline/types';
import type { LabelLayout, YearLayout } from '../types';
import { TIMELINE_CONFIG } from '../config/timelineConfig';

/**
 * 智能标签布局算法
 * 根据缩放级别和优先级智能排列事件标签，避免重叠
 */
export const calculateLabelLayout = (
  events: Event[],
  xScale: d3.ScaleLinear<number, number>,
  height: number,
  favorites: string[],
  currentZoom: number
): LabelLayout[] => {
  const labels: LabelLayout[] = [];
  const { layout } = TIMELINE_CONFIG;
  
  // 根据缩放级别动态调整参数
  const minDistance = Math.max(layout.minDistance, 120 / currentZoom);
  const labelHeight = 20;
  const maxLevels = Math.min(layout.maxLevels, Math.max(2, Math.floor(currentZoom / 2) + 2));
  
  // 按重要性排序事件（收藏的事件优先显示）
  const sortedEvents = [...events].sort((a, b) => {
    const aFav = favorites.includes(a.id) ? 1 : 0;
    const bFav = favorites.includes(b.id) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return a.startYear - b.startYear;
  });

  sortedEvents.forEach((event) => {
    const x = xScale(event.startYear);
    const title = event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title;
    const textWidth = title.length * 7; // 估算文字宽度
    const priority = favorites.includes(event.id) ? 10 : 1;
    
    let level = 0;
    let placed = false;
    
    // 寻找合适的层级
    while (level < maxLevels && !placed) {
      const y = level % 2 === 0 ? 
        height / 2 - 25 - (Math.floor(level / 2) * layout.levelSpacing) : 
        height / 2 + 25 + (Math.floor(level / 2) * layout.levelSpacing);
      
      // 检查是否与同层级的其他标签重叠
      const conflicts = labels.filter(label => 
        label.level === level && 
        Math.abs(label.x - x) < Math.max(minDistance, (label.width + textWidth) / 2 + 10)
      );
      
      if (conflicts.length === 0) {
        labels.push({
          event,
          x,
          y,
          width: textWidth,
          height: labelHeight,
          level,
          priority
        });
        placed = true;
      } else {
        level++;
      }
    }
    
    // 如果所有层级都冲突，尝试替换低优先级标签
    if (!placed && priority > 1) {
      for (let level = 0; level < maxLevels; level++) {
        const conflicts = labels.filter(label => 
          label.level === level && 
          Math.abs(label.x - x) < Math.max(minDistance, (label.width + textWidth) / 2 + 10)
        );
        
        const lowPriorityConflict = conflicts.find(c => c.priority < priority);
        if (lowPriorityConflict) {
          // 移除低优先级的标签
          const index = labels.indexOf(lowPriorityConflict);
          labels.splice(index, 1);
          
          // 添加当前标签
          const y = level % 2 === 0 ? 
            height / 2 - 25 - (Math.floor(level / 2) * layout.levelSpacing) : 
            height / 2 + 25 + (Math.floor(level / 2) * layout.levelSpacing);
          
          labels.push({
            event,
            x,
            y,
            width: textWidth,
            height: labelHeight,
            level,
            priority
          });
          placed = true;
          break;
        }
      }
    }
  });

  return labels;
};

/**
 * 智能年份标签布局算法
 * 避免年份标签重叠，优先显示重要事件的年份
 */
export const calculateYearLayout = (
  events: Event[],
  xScale: d3.ScaleLinear<number, number>,
  favorites: string[],
  currentZoom: number
): YearLayout[] => {
  const yearLabels: YearLayout[] = [];
  const { layout } = TIMELINE_CONFIG;
  
  // 根据缩放级别动态调整最小间距
  const minDistance = Math.max(layout.yearMinDistance, 80 / currentZoom);
  
  // 按重要性排序事件
  const sortedEvents = [...events].sort((a, b) => {
    const aFav = favorites.includes(a.id) ? 1 : 0;
    const bFav = favorites.includes(b.id) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return a.startYear - b.startYear;
  });

  sortedEvents.forEach((event) => {
    const x = xScale(event.startYear);
    const yearText = event.endYear && event.endYear !== event.startYear ? 
      `${event.startYear}-${event.endYear}` : `${event.startYear}`;
    const textWidth = yearText.length * 6; // 估算文字宽度
    const priority = favorites.includes(event.id) ? 10 : 1;
    
    // 检查是否与已有标签重叠
    const conflicts = yearLabels.filter(label => 
      Math.abs(label.x - x) < Math.max(minDistance, (label.width + textWidth) / 2 + 5)
    );
    
    if (conflicts.length === 0) {
      // 没有冲突，直接添加
      yearLabels.push({
        event,
        x,
        yearText,
        width: textWidth,
        priority
      });
    } else {
      // 有冲突，检查是否可以替换低优先级标签
      const lowPriorityConflict = conflicts.find(c => c.priority < priority);
      if (lowPriorityConflict) {
        const index = yearLabels.indexOf(lowPriorityConflict);
        yearLabels.splice(index, 1);
        yearLabels.push({
          event,
          x,
          yearText,
          width: textWidth,
          priority
        });
      }
    }
  });

  return yearLabels;
};