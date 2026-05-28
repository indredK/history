import type { Dynasty } from '@/services/culture/types';
import type { Event } from '@/services/timeline/types';

export interface TimelineDerivedEvent extends Event {
  normalizedCategory: TimelineEventCategory;
  isMajor: boolean;
  searchText: string;
}

export interface TimelineYearCluster {
  id: string;
  year: number;
  category: TimelineEventCategory;
  events: TimelineDerivedEvent[];
  dynastyIds: string[];
}

export interface TimelineDynastyCluster {
  id: string;
  dynastyId: string;
  category: TimelineEventCategory;
  startYear: number;
  endYear: number;
  events: TimelineDerivedEvent[];
}

export const EVENT_TYPE_LABELS = [
  '战争',
  '政治',
  '文化/科技',
  '外交',
  '经济',
  '其他',
] as const;

export type TimelineEventCategory = (typeof EVENT_TYPE_LABELS)[number];
const EVENT_TYPE_LABEL_SET = new Set<string>(EVENT_TYPE_LABELS);

export const EVENT_TYPE_MAP: Record<string, TimelineEventCategory> = {
  war: '战争',
  military: '战争',
  battle: '战争',
  political_event: '政治',
  political_reform: '政治',
  diplomatic_event: '外交',
  political_stability: '政治',
  political: '政治',
  political_fragmentation: '政治',
  political_revolution: '政治',
  political_movement: '政治',
  social_movement: '政治',
  cultural_event: '文化/科技',
  cultural: '文化/科技',
  cultural_flourishing: '文化/科技',
  engineering: '文化/科技',
  technology: '文化/科技',
  invention: '文化/科技',
  economy: '经济',
  economic: '经济',
  trade: '经济',
  diplomacy: '外交',
  foreign_affairs: '外交',
};

export function getTimelineEventCategory(eventType?: string | null): TimelineEventCategory {
  if (eventType && EVENT_TYPE_LABEL_SET.has(eventType)) {
    return eventType as TimelineEventCategory;
  }

  return EVENT_TYPE_MAP[eventType ?? ''] ?? '其他';
}

function normalizeCategory(event: Event): TimelineEventCategory {
  return getTimelineEventCategory(event.eventType);
}

function buildSearchText(event: Event): string {
  return [event.title, event.title_en, event.description, event.eventType]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function deriveTimelineEvents(events: Event[]): TimelineDerivedEvent[] {
  return events.map((event) => ({
    ...event,
    normalizedCategory: normalizeCategory(event),
    isMajor: (event.demoPriority ?? 0) >= 8,
    searchText: buildSearchText(event),
  }));
}

export function filterTimelineEvents(
  events: TimelineDerivedEvent[],
  args: {
    selectedDynastyIds: string[];
    selectedEventTypes: string[];
    keyword: string;
    jumpRange: { startYear: number; endYear: number } | null;
  },
): TimelineDerivedEvent[] {
  const keyword = args.keyword.trim().toLowerCase();

  return events.filter((event) => {
    if (args.selectedDynastyIds.length > 0 && (!event.dynastyId || !args.selectedDynastyIds.includes(event.dynastyId))) {
      return false;
    }

    if (args.selectedEventTypes.length > 0 && !args.selectedEventTypes.includes(event.normalizedCategory)) {
      return false;
    }

    if (keyword && !event.searchText.includes(keyword)) {
      return false;
    }

    if (args.jumpRange) {
      const eventEnd = event.endYear ?? event.startYear;
      if (event.startYear > args.jumpRange.endYear || eventEnd < args.jumpRange.startYear) {
        return false;
      }
    }

    return true;
  });
}

export function buildTimelineYearClusters(events: TimelineDerivedEvent[]): TimelineYearCluster[] {
  const bucket = new Map<string, TimelineDerivedEvent[]>();

  for (const event of events) {
    const key = `${event.startYear}:${event.normalizedCategory}`;
    const group = bucket.get(key) ?? [];
    group.push(event);
    bucket.set(key, group);
  }

  return [...bucket.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => {
      const [yearText, category] = key.split(':');
      return {
        id: `year:${key}`,
        year: Number(yearText),
        category: getTimelineEventCategory(category),
        events: group,
        dynastyIds: [...new Set(group.map((event) => event.dynastyId).filter(Boolean) as string[])],
      };
    });
}

export function shouldUseMajorOnlyMode(
  densityMode: 'auto' | 'major-only' | 'all',
  range: [number, number] | null,
  threshold = 300,
): boolean {
  if (densityMode === 'major-only') {
    return true;
  }

  if (densityMode === 'all' || !range) {
    return false;
  }

  return Math.abs(range[1] - range[0]) > threshold;
}

export function shouldUseClusterMode(
  range: [number, number] | null,
  threshold = 180,
): boolean {
  if (!range) {
    return false;
  }

  return Math.abs(range[1] - range[0]) > threshold;
}

export function buildTimelineDynastyClusters(
  events: TimelineDerivedEvent[],
  dynasties: Dynasty[],
  bucketSize = 40,
): TimelineDynastyCluster[] {
  const dynastyMap = new Map(dynasties.map((dynasty) => [dynasty.id, dynasty]));
  const bucket = new Map<string, TimelineDerivedEvent[]>();

  for (const event of events) {
    if (!event.dynastyId) {
      continue;
    }

    const dynasty = dynastyMap.get(event.dynastyId);
    if (!dynasty) {
      continue;
    }

    const baseYear = dynasty.startYear;
    const offset = Math.max(event.startYear - baseYear, 0);
    const bucketIndex = Math.floor(offset / bucketSize);
    const key = `${dynasty.id}:${event.normalizedCategory}:${bucketIndex}`;
    const group = bucket.get(key) ?? [];
    group.push(event);
    bucket.set(key, group);
  }

  return [...bucket.entries()]
    .filter(([, group]) => group.length > 2)
    .map(([key, group]) => {
      const [dynastyId, category, bucketIndexText] = key.split(':');
      const dynasty = dynastyMap.get(dynastyId ?? '');
      const bucketIndex = Number(bucketIndexText);
      const startYear = (dynasty?.startYear ?? 0) + bucketIndex * bucketSize;
      const endYear = startYear + bucketSize - 1;

      return {
        id: `dynasty:${key}`,
        dynastyId: dynastyId ?? '',
        category: getTimelineEventCategory(category),
        startYear,
        endYear,
        events: group,
      };
    });
}
