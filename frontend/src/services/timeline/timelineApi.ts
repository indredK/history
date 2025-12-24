import type { TimelineService } from './timelineService';
import { createUnifiedService } from '../base/serviceFactory';
import type { Event } from './types';

// 数据转换器
function transformJsonToEvent(jsonEvent: any, index: number): Event {
  const eventTypeStr = jsonEvent.eventType || jsonEvent.event_type || '';
  const eventTypes = eventTypeStr ? eventTypeStr.split(',').map((t: string) => t.trim()) : [];
  
  return {
    id: jsonEvent.id || `evt_${jsonEvent.title?.replace(/\s+/g, '_')}_${index}`,
    title: jsonEvent.title,
    title_en: jsonEvent.title_en || jsonEvent.titleEn,
    startYear: jsonEvent.startYear ?? jsonEvent.start_year,
    startMonth: jsonEvent.startMonth ?? jsonEvent.start_month,
    endYear: jsonEvent.endYear ?? jsonEvent.end_year,
    endMonth: jsonEvent.endMonth ?? jsonEvent.end_month,
    description: jsonEvent.description,
    eventType: eventTypes[0] || 'unknown',
    categories: eventTypes.length > 0 ? [eventTypes] : [],
    sources: jsonEvent.sources || (jsonEvent.source ? [{ id: `src_${jsonEvent.source}`, title: jsonEvent.source }] : []),
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<Event>(
  '/events',
  '/data/json/events.json',
  transformJsonToEvent
);

export const timelineApi: TimelineService = {
  ...unifiedService,
  getEvents: () => unifiedService.getAll(),
};
