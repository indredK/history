import type { TimelineService } from './timelineService';
import type { Event } from './types';
import { loadJsonData } from '@/services/utils/dataLoader';

// 转换 JSON 数据为 Event 格式
function transformJsonToEvent(jsonEvent: any, index: number): Event {
  const eventTypes = jsonEvent.event_type ? jsonEvent.event_type.split(',').map((t: string) => t.trim()) : [];
  
  return {
    id: `evt_${jsonEvent.title.replace(/\s+/g, '_')}_${index}`,
    title: jsonEvent.title,
    title_en: jsonEvent.title_en,
    startYear: jsonEvent.start_year,
    startMonth: jsonEvent.start_month,
    endYear: jsonEvent.end_year,
    endMonth: jsonEvent.end_month,
    description: jsonEvent.description,
    eventType: eventTypes[0] || 'unknown',
    categories: eventTypes.length > 0 ? [eventTypes] : [],
    sources: jsonEvent.source ? [{ id: `src_${jsonEvent.source}`, title: jsonEvent.source }] : [],
  };
}

// 缓存加载的数据
let cachedEvents: Event[] | null = null;

// 延迟1秒获取数据
async function delay() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

export const timelineMock: TimelineService = {
  getEvents: async () => {
    await delay();
    
    if (cachedEvents) {
      return { data: cachedEvents };
    }

    const jsonEvents = await loadJsonData<any>('/data/json/events.json');
    cachedEvents = jsonEvents.map(transformJsonToEvent);
    return { data: cachedEvents };
  },
  getEventsByRange: async (startYear: number, endYear: number) => {
    await delay();
    
    if (!cachedEvents) {
      const jsonEvents = await loadJsonData<any>('/data/json/events.json');
      cachedEvents = jsonEvents.map(transformJsonToEvent);
    }
    
    const filtered = cachedEvents.filter(
      (e) => e.startYear <= endYear && (e.endYear ?? e.startYear) >= startYear
    );
    
    return { data: filtered };
  },
};
