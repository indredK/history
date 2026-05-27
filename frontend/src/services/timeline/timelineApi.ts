import type { TimelineService } from './timelineService';
import { createUnifiedService } from '../base/serviceFactory';
import type { Event } from './types';

// 数据转换器
function transformJsonToEvent(jsonEvent: unknown, index: number): Event {
  const raw = (jsonEvent ?? {}) as Record<string, unknown>;
  const eventTypeStr =
    (raw['eventType'] as string | undefined) ??
    (raw['event_type'] as string | undefined) ??
    '';
  const eventTypes = eventTypeStr
    ? eventTypeStr.split(',').map((t) => t.trim())
    : [];

  const title = raw['title'] as string | undefined;
  const source = raw['source'] as string | undefined;
  const sources = raw['sources'] as Event['sources'] | undefined;

  return {
    id:
      (raw['id'] as string | undefined) ||
      `evt_${title?.replace(/\s+/g, '_') ?? ''}_${index}`,
    title: title!,
    title_en:
      (raw['title_en'] as string | undefined) ??
      (raw['titleEn'] as string | undefined),
    startYear:
      (raw['startYear'] as number | undefined) ??
      (raw['start_year'] as number | undefined),
    startMonth:
      (raw['startMonth'] as number | undefined) ??
      (raw['start_month'] as number | undefined),
    endYear:
      (raw['endYear'] as number | undefined) ??
      (raw['end_year'] as number | undefined),
    endMonth:
      (raw['endMonth'] as number | undefined) ??
      (raw['end_month'] as number | undefined),
    description: raw['description'] as string | undefined,
    eventType: eventTypes[0] || 'unknown',
    categories: eventTypes.length > 0 ? [eventTypes] : [],
    sources:
      sources ?? (source ? [{ id: `src_${source}`, title: source }] : []),
  } as Event;
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
