import type { Place } from '@/services/map/types';
import type { Event } from '@/services/timeline/types';

export interface ResolvedEventLocations {
  matchedPlaces: Place[];
  unmatchedNames: string[];
}

function normalize(input: string): string {
  return input.trim().replace(/\s+/g, '').toLowerCase();
}

export function resolveEventLocations(
  event: Event | null | undefined,
  places: Place[],
): ResolvedEventLocations {
  const names = event?.mapLocationHints ?? event?.rawLocations ?? [];
  if (names.length === 0) {
    return { matchedPlaces: [], unmatchedNames: [] };
  }

  const placeIndex = new Map<string, Place>();
  for (const place of places) {
    placeIndex.set(normalize(place.canonical_name), place);
    for (const altName of place.alt_names ?? []) {
      placeIndex.set(normalize(altName), place);
    }
  }

  const matchedPlaces: Place[] = [];
  const seenIds = new Set<string>();
  const unmatchedNames: string[] = [];

  for (const name of names) {
    const match = placeIndex.get(normalize(name));
    if (!match) {
      unmatchedNames.push(name);
      continue;
    }
    if (seenIds.has(match.id)) continue;
    seenIds.add(match.id);
    matchedPlaces.push(match);
  }

  return { matchedPlaces, unmatchedNames };
}
