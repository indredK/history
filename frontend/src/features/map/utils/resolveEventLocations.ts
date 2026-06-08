import type { Place } from '@/services/map/types';
import type { Event } from '@/services/timeline/types';

export interface ResolvedEventLocations {
  matchedPlaces: Place[];
  unmatchedNames: string[];
}

function normalize(input: string): string {
  return input.trim().replace(/\s+/g, '').toLowerCase();
}

function getPlaceAliases(place: Place): string[] {
  return [place.canonical_name, ...(place.alt_names ?? [])]
    .map((name) => name.trim())
    .filter(Boolean);
}

function getExplicitLocationNames(event: Event | null | undefined): string[] {
  if (event?.mapLocationHints?.length) {
    return event.mapLocationHints;
  }

  return event?.rawLocations ?? [];
}

function inferPlacesFromEventText(event: Event, places: Place[]): Place[] {
  const haystack = normalize(
    [event.title, event.description, ...(event.rawParticipants ?? [])]
      .filter(Boolean)
      .join(' '),
  );

  if (!haystack) return [];

  return places.filter((place) =>
    getPlaceAliases(place).some((alias) => {
      const normalizedAlias = normalize(alias);
      return normalizedAlias.length >= 2 && haystack.includes(normalizedAlias);
    }),
  );
}

export function resolveEventLocations(
  event: Event | null | undefined,
  places: Place[],
): ResolvedEventLocations {
  if (!event) {
    return { matchedPlaces: [], unmatchedNames: [] };
  }

  const names = getExplicitLocationNames(event);
  if (names.length === 0) {
    return {
      matchedPlaces: inferPlacesFromEventText(event, places),
      unmatchedNames: [],
    };
  }

  const placeIndex = new Map<string, Place>();
  for (const place of places) {
    for (const alias of getPlaceAliases(place)) {
      placeIndex.set(normalize(alias), place);
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
