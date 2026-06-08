import type { TimelineService } from './timelineService';
import type { Event } from './types';
import { loadJsonData } from '@/utils/services/dataLoaders';

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
    sources?: Array<{ id: string; title?: string; url?: string }>;
    source_ids?: string[];
    mapFocusStartYear?: number;
    mapFocusEndYear?: number;
    mapLocationHints?: string[];
    confidence?: number;
    demoPriority?: number;
  }>;
}

function transformEvent(
  raw: TimelineByEventTypeFile['events'][number]
): Event {
  const event: Event = {
    id: raw.id,
    title: raw.title,
    startYear: raw.time.startYear,
    endYear: raw.time.endYear,
    eventType: raw.eventType[0] || 'unknown',
    dynastyId: raw.dynastyId,
  };

  if (raw.description) event.description = raw.description;
  if (raw.eventType.length > 0) event.categories = [raw.eventType];
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

async function getEventsFromAllFiles(): Promise<{ data: Event[] }> {
  const index = await loadJsonData<TimelineByEventTypeIndex>(
    '/data/json/timeline-by-eventtype/index.json'
  );

  const allEvents: Event[] = [];
  const loadPromises = index.categories.map(async (entry) => {
    try {
      const fileData = await loadJsonData<TimelineByEventTypeFile>(entry.file);
      for (const raw of fileData.events) {
        allEvents.push(transformEvent(raw));
      }
    } catch (err) {
      console.error(`Failed to load ${entry.file}:`, err);
    }
  });

  await Promise.all(loadPromises);
  allEvents.sort((left, right) => {
    const yearDiff = left.startYear - right.startYear;
    if (yearDiff !== 0) return yearDiff;

    const endYearDiff =
      (left.endYear ?? left.startYear) - (right.endYear ?? right.startYear);
    if (endYearDiff !== 0) return endYearDiff;

    return left.title.localeCompare(right.title, 'zh-Hans-CN');
  });

  return { data: allEvents };
}

const getAll = async (): Promise<{ data: Event[] }> => getEventsFromAllFiles();

export const timelineApi: TimelineService = {
  getEvents: getEventsFromAllFiles,
  getAll,
};
