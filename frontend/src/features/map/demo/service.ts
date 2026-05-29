import { loadJsonData } from '@/utils/services/dataLoaders';
import { MAP_MOCK_DATA_PATH } from '@/config/mapDataPaths';
import type { Dynasty } from '@/services/culture/types';
import type { Event } from '@/services/timeline/types';
import type { BoundaryGeoJSON, Place } from '@/services/map/types';
import type { DemoBoundaryMapping, DemoTimelineBundle, HistoricalMapSnapshot } from './types';

const DEMO_BASE_PATH = MAP_MOCK_DATA_PATH;

const cache = new Map<string, Promise<unknown>>();

function loadCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) {
    cache.set(key, loader());
  }
  return cache.get(key) as Promise<T>;
}

function splitCsv(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function transformDemoEvent(raw: Record<string, unknown>, index: number): Event {
  const title = raw['title'] as string | undefined;
  const locations = splitCsv(raw['locations'] as string | undefined);
  const participants = splitCsv(raw['participants'] as string | undefined);
  const locationHints = Array.isArray(raw['map_location_hints'])
    ? (raw['map_location_hints'] as string[])
    : locations;
  const startYear =
    (raw['startYear'] as number | undefined) ??
    (raw['start_year'] as number | undefined) ??
    0;
  const endYear =
    (raw['endYear'] as number | undefined) ??
    (raw['end_year'] as number | undefined);
  const eventTypeStr =
    (raw['eventType'] as string | undefined) ??
    (raw['event_type'] as string | undefined) ??
    '';
  const eventTypes = eventTypeStr
    ? eventTypeStr.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

  const event: Event = {
    id:
      (raw['id'] as string | undefined) ||
      `map_demo_evt_${title?.replace(/\s+/g, '_') ?? index}`,
    title: title ?? `未命名事件 ${index + 1}`,
    startYear,
    categories: eventTypes.length > 0 ? [eventTypes] : [],
    mapFocusStartYear:
      (raw['map_focus_start_year'] as number | undefined) ?? startYear,
    mapFocusEndYear:
      (raw['map_focus_end_year'] as number | undefined) ?? endYear ?? startYear,
  };

  const titleEn =
    (raw['title_en'] as string | undefined) ??
    (raw['titleEn'] as string | undefined);
  if (titleEn !== undefined) {
    event.title_en = titleEn;
  }
  if (endYear !== undefined) {
    event.endYear = endYear;
  }
  if (typeof raw['description'] === 'string') {
    event.description = raw['description'];
  }
  if (eventTypes[0]) {
    event.eventType = eventTypes[0];
  }
  if (locations !== undefined) {
    event.rawLocations = locations;
  }
  if (participants !== undefined) {
    event.rawParticipants = participants;
  }
  if (locationHints !== undefined) {
    event.mapLocationHints = locationHints;
  }
  if (typeof raw['dynasty_id'] === 'string') {
    event.dynastyId = raw['dynasty_id'];
  }
  if (typeof raw['demo_priority'] === 'number') {
    event.demoPriority = raw['demo_priority'];
  }

  return event;
}

function transformDemoPlace(raw: Record<string, unknown>, index: number): Place {
  const longitude = raw['longitude'] as number | undefined;
  const latitude = raw['latitude'] as number | undefined;
  const place: Place = {
    id:
      (raw['id'] as string | undefined) ||
      `map_demo_place_${(raw['canonical_name'] as string | undefined)?.replace(/\s+/g, '_') ?? index}`,
    canonical_name: raw['canonical_name'] as string,
  };

  const altNames = splitCsv(raw['alt_names'] as string | undefined);
  if (altNames !== undefined) {
    place.alt_names = altNames;
  }
  if (typeof raw['description'] === 'string') {
    place.description = raw['description'];
  }
  if (longitude !== undefined && latitude !== undefined) {
    place.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }
  if (raw['source']) {
    place.source_ids = [`src_${raw['source'] as string}`];
  }

  return place;
}

async function loadDynasties(): Promise<Dynasty[]> {
  return loadCached('map-demo-dynasties', () =>
    loadJsonData<Dynasty[]>(`${DEMO_BASE_PATH}/dynasties.json`),
  );
}

async function loadEvents(): Promise<Event[]> {
  return loadCached('map-demo-events', async () => {
    const raw = await loadJsonData<Record<string, unknown>[]>(
      `${DEMO_BASE_PATH}/events.json`,
    );
    return raw.map(transformDemoEvent);
  });
}

async function loadPlaces(): Promise<Place[]> {
  return loadCached('map-demo-places', async () => {
    const raw = await loadJsonData<Record<string, unknown>[]>(
      `${DEMO_BASE_PATH}/places.json`,
    );
    return raw.map(transformDemoPlace);
  });
}

async function loadBoundaryMappings(): Promise<DemoBoundaryMapping[]> {
  return loadCached('map-demo-boundary-mappings', () =>
    loadJsonData<DemoBoundaryMapping[]>(`${DEMO_BASE_PATH}/boundary-mappings.json`),
  );
}

async function loadBoundaryByPeriod(period: string): Promise<BoundaryGeoJSON | null> {
  return loadCached(`map-demo-boundary-${period}`, async () => {
    const mappings = await loadBoundaryMappings();
    const target = mappings.find((item) => item.period === period);
    if (!target) return null;
    return loadJsonData<BoundaryGeoJSON>(`${DEMO_BASE_PATH}/${target.file}`);
  });
}

async function getBoundarySnapshotByYear(year: number): Promise<HistoricalMapSnapshot> {
  const mappings = await loadBoundaryMappings();
  const mapping =
    mappings
      .filter((item) => year >= item.validFrom && year <= item.validTo)
      .sort((left, right) => right.validFrom - left.validFrom)[0] ?? null;
  if (!mapping) {
    return { boundary: null, mapping: null };
  }
  const boundary = await loadBoundaryByPeriod(mapping.period);
  return { boundary, mapping };
}

async function loadBundle(): Promise<DemoTimelineBundle> {
  const [dynasties, events, places, boundaryMappings] = await Promise.all([
    loadDynasties(),
    loadEvents(),
    loadPlaces(),
    loadBoundaryMappings(),
  ]);
  return { dynasties, events, places, boundaryMappings };
}

export const mapTimelineDemoService = {
  loadDynasties,
  loadEvents,
  loadPlaces,
  loadBoundaryMappings,
  loadBoundaryByPeriod,
  getBoundarySnapshotByYear,
  loadBundle,
};
