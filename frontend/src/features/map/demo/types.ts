import type { BoundaryGeoJSON, BoundaryMapping, Place } from '@/services/map/types';
import type { Dynasty } from '@/services/culture/types';
import type { Event } from '@/services/timeline/types';

export interface DemoBoundaryMapping extends BoundaryMapping {
  dynastyId?: string;
  defaultFocusYear?: number;
}

export interface DemoTimelineBundle {
  dynasties: Dynasty[];
  events: Event[];
  places: Place[];
  boundaryMappings: DemoBoundaryMapping[];
}

export interface ResolvedEventLocations {
  matchedPlaces: Place[];
  unmatchedNames: string[];
}

export interface HistoricalMapSnapshot {
  boundary: BoundaryGeoJSON | null;
  mapping: DemoBoundaryMapping | null;
}
