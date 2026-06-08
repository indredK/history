import { getDataSourceMode } from '@/config/dataSource';
import { apiClient, handleSingleApiResponse } from '@/utils/services/apiClient';
import { loadJsonData } from '@/utils/services/dataLoaders';
import { fetchApiListData } from '@/utils/services/serviceFactory';
import type { TimelineService } from './timelineService';
import type {
  Event,
  EventInput,
  EventLocationRef,
  EventParticipantRef,
  SourceRef,
} from './types';

interface TimelineByEventTypeIndex {
  generatedAt: string;
  totalEvents: number;
  categories: Array<{
    category: string;
    file: string;
    eventCount: number;
  }>;
}

interface TimelineByEventTypeFile {
  category: string;
  eventCount: number;
  events: Array<{
    id: string;
    dynastyId: string;
    time: {
      startYear: number;
      endYear: number;
    };
    title: string;
    description: string;
    eventType: string[];
    categories?: string[][];
    imageUrls?: string[];
    rawLocations?: string[];
    rawParticipants?: string[];
    sources?: Array<{ id: string; title?: string; url?: string; author?: string }>;
    source_ids?: string[];
    mapFocusStartYear?: number;
    mapFocusEndYear?: number;
    mapLocationHints?: string[];
    confidence?: number;
    demoPriority?: number;
  }>;
}

const API_ENDPOINT = '/events';

let mockCache: Event[] | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function eventTypeToTokens(eventType?: string | null): string[] {
  return (eventType ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeEventInput(input: EventInput, id: string): Event {
  const eventType = input.eventType
    ? Array.from(new Set(eventTypeToTokens(input.eventType))).join(',')
    : '';

  const event: Event = {
    id,
    title: input.title.trim(),
    startYear: input.startYear,
    eventType: eventType || 'unknown',
  };

  if (input.endYear !== undefined && input.endYear !== null) event.endYear = input.endYear;
  if (input.description?.trim()) event.description = input.description.trim();
  if (eventType) event.categories = [eventTypeToTokens(eventType)];
  if (input.participants) {
    event.participants = input.participants.map((item) => ({
      personId: item.personId,
      role: item.role ?? null,
    }));
    event.rawParticipants = input.participants.map((item) => item.personId);
  }
  if (input.locations) {
    event.locations = input.locations.map((item) => ({
      placeId: item.placeId,
      role: item.role ?? null,
    }));
    event.rawLocations = input.locations.map((item) => item.placeId);
  }
  if (input.sourceIds) event.source_ids = input.sourceIds;

  return event;
}

function transformStaticEvent(
  raw: TimelineByEventTypeFile['events'][number]
): Event {
  const categories =
    raw.categories && raw.categories.length > 0
      ? raw.categories
      : raw.eventType.length > 0
        ? [raw.eventType]
        : [];

  const event: Event = {
    id: raw.id,
    title: raw.title,
    startYear: raw.time.startYear,
    endYear: raw.time.endYear,
    eventType: raw.eventType[0] || 'unknown',
    dynastyId: raw.dynastyId,
  };

  if (raw.description) event.description = raw.description;
  if (categories.length > 0) event.categories = categories;
  if (raw.imageUrls) event.imageUrls = raw.imageUrls;
  if (raw.rawLocations) event.rawLocations = raw.rawLocations;
  if (raw.rawParticipants) event.rawParticipants = raw.rawParticipants;
  if (raw.sources) event.sources = raw.sources;
  if (raw.confidence !== undefined) event.confidence = raw.confidence;
  if (raw.demoPriority !== undefined) event.demoPriority = raw.demoPriority;
  if (raw.mapFocusStartYear !== undefined) event.mapFocusStartYear = raw.mapFocusStartYear;
  if (raw.mapFocusEndYear !== undefined) event.mapFocusEndYear = raw.mapFocusEndYear;
  if (raw.mapLocationHints) event.mapLocationHints = raw.mapLocationHints;
  if (raw.source_ids) event.source_ids = raw.source_ids;

  return event;
}

function transformApiEvent(raw: unknown, index = 0): Event {
  const source = isRecord(raw) ? raw : {};
  const id = readString(source.id) || `event-${index + 1}`;
  const eventType = readString(source.eventType);
  const startYear = readNumber(source.startYear) ?? 0;
  const endYear = readNumber(source.endYear);
  const participants: EventParticipantRef[] = Array.isArray(source.participants)
    ? source.participants.filter(isRecord).map((item) => {
        const participant: EventParticipantRef = {
          personId: readString(item.personId),
          role: readString(item.role) || null,
          person: isRecord(item.person)
            ? {
                id: readString(item.person.id),
                name: readString(item.person.name),
                dynasty: readString(item.person.dynasty) || null,
              }
            : null,
        };
        if (readString(item.id)) {
          participant.id = readString(item.id);
        }
        return participant;
      }).filter((item) => item.personId)
    : [];
  const locations: EventLocationRef[] = Array.isArray(source.locations)
    ? source.locations.filter(isRecord).map((item) => {
        const location: EventLocationRef = {
          placeId: readString(item.placeId),
          role: readString(item.role) || null,
          place: isRecord(item.place)
            ? {
                id: readString(item.place.id),
                name: readString(item.place.name),
                latitude: readNumber(item.place.latitude) ?? null,
                longitude: readNumber(item.place.longitude) ?? null,
              }
            : null,
        };
        if (readString(item.id)) {
          location.id = readString(item.id);
        }
        return location;
      }).filter((item) => item.placeId)
    : [];
  const sources = Array.isArray(source.sources)
    ? source.sources.filter(isRecord).map((item) => {
        const sourceRef: SourceRef = {
          id: readString(item.id),
          title: readString(item.title),
        };
        if (readString(item.url)) {
          Object.assign(sourceRef, { url: readString(item.url) });
        }
        if (readString(item.author)) {
          Object.assign(sourceRef, { author: readString(item.author) });
        }
        return sourceRef;
      }).filter((item) => item.id)
    : [];

  const event: Event = {
    id,
    title: readString(source.title) || `未命名事件 ${index + 1}`,
    startYear,
    eventType: eventType || 'unknown',
  };

  if (endYear !== undefined) event.endYear = endYear;
  if (readString(source.description)) event.description = readString(source.description);
  if (eventType) event.categories = [eventTypeToTokens(eventType)];
  if (participants.length > 0) {
    event.participants = participants;
    event.rawParticipants = participants.map((item) => item.person?.name || item.personId);
  }
  if (locations.length > 0) {
    event.locations = locations;
    event.rawLocations = locations.map((item) => item.place?.name || item.placeId);
  }
  if (sources.length > 0) {
    event.sources = sources;
    event.source_ids = sources.map((item) => item.id);
  }
  if (readString(source.createdAt)) event.created_at = readString(source.createdAt);
  if (readString(source.updatedAt)) event.updated_at = readString(source.updatedAt);

  return event;
}

function sortEvents(events: Event[]): Event[] {
  return [...events].sort((left, right) => {
    const yearDiff = left.startYear - right.startYear;
    if (yearDiff !== 0) return yearDiff;

    const endYearDiff =
      (left.endYear ?? left.startYear) - (right.endYear ?? right.startYear);
    if (endYearDiff !== 0) return endYearDiff;

    return left.title.localeCompare(right.title, 'zh-Hans-CN');
  });
}

async function getStaticEvents(): Promise<Event[]> {
  if (mockCache) {
    return sortEvents(mockCache);
  }

  const index = await loadJsonData<TimelineByEventTypeIndex>(
    '/data/json/timeline-by-eventtype/index.json'
  );

  const allEvents: Event[] = [];
  const loadPromises = index.categories.map(async (entry) => {
    try {
      const fileData = await loadJsonData<TimelineByEventTypeFile>(entry.file);
      for (const raw of fileData.events) {
        allEvents.push(transformStaticEvent(raw));
      }
    } catch (err) {
      console.error(`时间轴分类文件加载失败 (${entry.file}):`, err);
    }
  });

  await Promise.all(loadPromises);
  mockCache = sortEvents(allEvents);
  return [...mockCache];
}

async function getApiEvents(): Promise<Event[]> {
  const apiItems = await fetchApiListData(API_ENDPOINT);
  return sortEvents(apiItems.map((item, index) => transformApiEvent(item, index)));
}

async function createApiEvent(input: EventInput): Promise<Event> {
  const response = await apiClient.post(API_ENDPOINT, input);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return transformApiEvent(apiResponse.data);
}

async function updateApiEvent(id: string, input: EventInput): Promise<Event> {
  const response = await apiClient.patch(`${API_ENDPOINT}/${id}`, input);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return transformApiEvent(apiResponse.data);
}

async function deleteApiEvent(id: string): Promise<Event | null> {
  const response = await apiClient.delete(`${API_ENDPOINT}/${id}`);
  const apiResponse = handleSingleApiResponse<unknown>(response);
  return apiResponse.data ? transformApiEvent(apiResponse.data) : null;
}

async function createMockEvent(input: EventInput): Promise<Event> {
  const current = await getStaticEvents();
  const item = normalizeEventInput(input, `event-${Date.now()}`);
  mockCache = sortEvents([item, ...current]);
  return item;
}

async function updateMockEvent(id: string, input: EventInput): Promise<Event> {
  const current = await getStaticEvents();
  const item = normalizeEventInput(input, id);
  const exists = current.some((event) => event.id === id);
  mockCache = sortEvents(exists
    ? current.map((event) => (event.id === id ? { ...event, ...item } : event))
    : [item, ...current]);
  return item;
}

async function deleteMockEvent(id: string): Promise<Event | null> {
  const current = await getStaticEvents();
  const deleted = current.find((event) => event.id === id) || null;
  mockCache = current.filter((event) => event.id !== id);
  return deleted;
}

async function getEventsFromSource(): Promise<{ data: Event[] }> {
  if (getDataSourceMode() === 'mock') {
    return { data: await getStaticEvents() };
  }

  try {
    return { data: await getApiEvents() };
  } catch (error) {
    console.error('事件 API 数据加载失败，回退到静态时间轴数据:', error);
    return { data: await getStaticEvents() };
  }
}

const getAll = async (): Promise<{ data: Event[] }> => getEventsFromSource();

export const timelineApi: TimelineService = {
  getEvents: getEventsFromSource,
  getAll,
  createEvent: async (input) => {
    if (getDataSourceMode() === 'mock') {
      return { data: await createMockEvent(input) };
    }
    return { data: await createApiEvent(input) };
  },
  updateEvent: async (id, input) => {
    if (getDataSourceMode() === 'mock') {
      return { data: await updateMockEvent(id, input) };
    }
    return { data: await updateApiEvent(id, input) };
  },
  deleteEvent: async (id) => {
    if (getDataSourceMode() === 'mock') {
      return { data: await deleteMockEvent(id) };
    }
    return { data: await deleteApiEvent(id) };
  },
};

export const getEvents = timelineApi.getEvents;
export const createEvent = (input: EventInput) => timelineApi.createEvent!(input);
export const updateEvent = (id: string, input: EventInput) => timelineApi.updateEvent!(id, input);
export const deleteEvent = (id: string) => timelineApi.deleteEvent!(id);
