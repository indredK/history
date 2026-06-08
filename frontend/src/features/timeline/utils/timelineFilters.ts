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
  civil_war: '战争',
  rebellion: '战争',
  conquest: '战争',
  invasion: '战争',
  offensive: '战争',
  defense: '战争',
  defensive_war: '战争',
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
  culture: '文化/科技',
  cultural: '文化/科技',
  cultural_flourishing: '文化/科技',
  engineering: '文化/科技',
  technology: '文化/科技',
  invention: '文化/科技',
  economy: '经济',
  economic: '经济',
  economic_reform: '经济',
  economic_infrastructure: '经济',
  trade: '经济',
  diplomacy: '外交',
  foreign_affairs: '外交',
  diplomatic_visit: '外交',
  diplomatic_expedition: '外交',
};

export function getTimelineEventCategory(eventType?: string | null): TimelineEventCategory {
  const tokens = splitEventTypeValue(eventType);
  for (const token of tokens) {
    if (EVENT_TYPE_LABEL_SET.has(token)) {
      return token as TimelineEventCategory;
    }

    const mapped = EVENT_TYPE_MAP[token];
    if (mapped) {
      return mapped;
    }
  }

  return '其他';
}

function splitEventTypeValue(value?: string | null): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getEventTypeTokens(event: Pick<Event, 'eventType' | 'categories'>): string[] {
  const tokens = new Set<string>();

  for (const token of splitEventTypeValue(event.eventType)) {
    tokens.add(token);
  }

  for (const categoryPath of event.categories ?? []) {
    for (const token of categoryPath) {
      for (const nestedToken of splitEventTypeValue(token)) {
        tokens.add(nestedToken);
      }
    }
  }

  return [...tokens];
}

export function getTimelineEventCategories(
  event: Pick<Event, 'eventType' | 'categories'>,
): TimelineEventCategory[] {
  const categories = new Set<TimelineEventCategory>();
  const tokens = getEventTypeTokens(event);

  for (const token of tokens) {
    const category = getTimelineEventCategory(token);
    if (category !== '其他') {
      categories.add(category);
    }
  }

  if (categories.size === 0) {
    categories.add('其他');
  }

  return [...categories];
}

function normalizeCategory(event: Event): TimelineEventCategory {
  return getTimelineEventCategories(event)[0] ?? '其他';
}

function buildSearchText(event: Event): string {
  return [
    event.title,
    event.title_en,
    event.description,
    event.eventType,
    ...getEventTypeTokens(event),
  ]
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

    if (
      args.selectedEventTypes.length > 0
      && !getTimelineEventCategories(event).some((category) => args.selectedEventTypes.includes(category))
    ) {
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
    .flatMap(([key, group]) => {
      const [dynastyId, category, bucketIndexText] = key.split(':');
      const dynasty = dynastyMap.get(dynastyId ?? '');
      const bucketIndex = Number(bucketIndexText);
      if (!dynasty || !Number.isFinite(bucketIndex)) {
        return [];
      }

      const startYear = dynasty.startYear + bucketIndex * bucketSize;
      const endYear = startYear + bucketSize - 1;

      return [{
        id: `dynasty:${key}`,
        dynastyId: dynastyId ?? '',
        category: getTimelineEventCategory(category),
        startYear,
        endYear,
        events: group,
      }];
    });
}
