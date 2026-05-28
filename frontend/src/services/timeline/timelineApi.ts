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
  return {
    id: raw.id,
    title: raw.title,
    startYear: raw.time.startYear,
    endYear: raw.time.endYear,
    description: raw.description || undefined,
    eventType: raw.eventType[0] || 'unknown',
    categories: raw.eventType.length > 0 ? [raw.eventType] : undefined,
    dynastyId: raw.dynastyId,
    imageUrls: raw.imageUrls,
    rawLocations: raw.rawLocations,
    rawParticipants: raw.rawParticipants,
    sources: raw.sources,
    confidence: raw.confidence,
    demoPriority: raw.demoPriority,
  } as Event;
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
  return { data: allEvents };
}

const getAll = async (): Promise<{ data: Event[] }> => getEventsFromAllFiles();

export const timelineApi: TimelineService = {
  getEvents: getEventsFromAllFiles,
  getAll,
};
