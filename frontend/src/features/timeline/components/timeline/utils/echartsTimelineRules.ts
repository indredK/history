import type { Dynasty } from '@/services/culture/types';
import type { Event } from '@/services/timeline/types';

export type TimeRange = [number, number];

const MIN_WINDOW_SPAN = 1;

export function eventEnd(event: Event): number {
  return event.endYear ?? event.startYear;
}

export function sortDynasties(items: Dynasty[]): Dynasty[] {
  return [...items].sort((left, right) => left.startYear - right.startYear);
}

export function sortEvents(items: Event[]): Event[] {
  return [...items].sort((left, right) => {
    const leftEnd = eventEnd(left);
    const rightEnd = eventEnd(right);
    return left.startYear - right.startYear || leftEnd - rightEnd;
  });
}

export function buildBoundsRange(events: Event[], dynasties: Dynasty[]): TimeRange {
  const years: number[] = [];

  for (const event of events) {
    years.push(event.startYear);
    years.push(eventEnd(event));
  }

  for (const dynasty of dynasties) {
    years.push(dynasty.startYear);
    years.push(dynasty.endYear ?? dynasty.startYear);
  }

  if (years.length === 0) {
    return [-2200, 2050];
  }

  const min = Math.min(...years);
  const max = Math.max(...years);
  const pad = Math.max(40, Math.round((max - min) * 0.04));
  return [min - pad, max + pad];
}

export function buildDefaultWindowRange(bounds: TimeRange): TimeRange {
  const [start, end] = bounds;
  const span = Math.max(end - start, 1);
  const defaultSpan = Math.max(Math.min(Math.round(span * 0.2), span), 1);
  return [start, Math.min(start + defaultSpan, end)];
}

export function getDynastyRange(dynasty: Dynasty): TimeRange {
  return [dynasty.startYear, dynasty.endYear ?? dynasty.startYear];
}

export function focusRangeToDynasty(dynasty: Dynasty, bounds: TimeRange): TimeRange {
  return clampRangeToBounds(getDynastyRange(dynasty), bounds);
}

export function focusRangeToDynastyWithPadding(
  dynasty: Dynasty,
  bounds: TimeRange,
  paddingRatio = 0.08,
  minPadding = 10,
): TimeRange {
  const [start, end] = getDynastyRange(dynasty);
  const span = Math.max(end - start, 1);
  const padding = Math.max(Math.round(span * paddingRatio), minPadding);
  return shiftRangeWithinBounds([start - padding, end + padding], bounds);
}

export function clampRangeToBounds(range: TimeRange, bounds: TimeRange): TimeRange {
  return [
    Math.max(bounds[0], Math.min(range[0], range[1])),
    Math.min(bounds[1], Math.max(range[0], range[1])),
  ];
}

export function shiftRangeWithinBounds(range: TimeRange, bounds: TimeRange): TimeRange {
  const span = Math.max(range[1] - range[0], 1);
  const boundsSpan = Math.max(bounds[1] - bounds[0], 1);

  if (span >= boundsSpan) {
    return [bounds[0], bounds[1]];
  }

  let start = range[0];
  let end = range[1];

  if (start < bounds[0]) {
    start = bounds[0];
    end = start + span;
  }

  if (end > bounds[1]) {
    end = bounds[1];
    start = end - span;
  }

  return [start, end];
}

export function isSameRange(
  left: TimeRange | null | undefined,
  right: TimeRange | null | undefined,
  tolerance = 0.5,
): boolean {
  if (!left || !right) {
    return false;
  }

  return (
    Math.abs(left[0] - right[0]) <= tolerance &&
    Math.abs(left[1] - right[1]) <= tolerance
  );
}

export function eventOverlapsRange(event: Event, range: TimeRange): boolean {
  return event.startYear <= range[1] && eventEnd(event) >= range[0];
}

export function getHighlightedDynastyIdsForRange(
  range: TimeRange,
  dynasties: Dynasty[],
): string[] {
  const rangeStart = Math.min(range[0], range[1]);
  const rangeEnd = Math.max(range[0], range[1]);

  return dynasties
    .filter((dynasty) => {
      const dynastyEnd = dynasty.endYear ?? dynasty.startYear;
      return dynasty.startYear <= rangeEnd && dynastyEnd >= rangeStart;
    })
    .map((dynasty) => dynasty.id);
}

export function moveRangeToDynasty(
  currentRange: TimeRange,
  dynasty: Dynasty,
  bounds: TimeRange,
): TimeRange {
  const span = Math.max(currentRange[1] - currentRange[0], 1);
  const dynastyRange = getDynastyRange(dynasty);
  const dynastySpan = Math.max(dynastyRange[1] - dynastyRange[0], 1);

  if (span > dynastySpan) {
    return shiftRangeWithinBounds([dynastyRange[0], dynastyRange[0] + span], bounds);
  }

  if (currentRange[0] < dynastyRange[0]) {
    return shiftRangeWithinBounds([dynastyRange[0], dynastyRange[0] + span], bounds);
  }

  if (currentRange[1] > dynastyRange[1]) {
    return shiftRangeWithinBounds([dynastyRange[1] - span, dynastyRange[1]], bounds);
  }

  return shiftRangeWithinBounds(currentRange, bounds);
}

export function expandRangeAroundDynasty(
  dynasty: Dynasty,
  bounds: TimeRange,
  paddingRatio = 0.08,
  minPadding = 5,
): TimeRange {
  const dynastyRange = getDynastyRange(dynasty);
  const dynastySpan = Math.max(dynastyRange[1] - dynastyRange[0], 1);
  const padding = Math.max(Math.round(dynastySpan * paddingRatio), minPadding);

  return shiftRangeWithinBounds(
    [dynastyRange[0] - padding, dynastyRange[1] + padding],
    bounds,
  );
}

export function moveRangeToEvent(
  currentRange: TimeRange,
  event: Event,
  bounds: TimeRange,
): TimeRange {
  if (eventOverlapsRange(event, currentRange)) {
    return shiftRangeWithinBounds(currentRange, bounds);
  }

  const span = Math.max(currentRange[1] - currentRange[0], 1);
  const eventStart = event.startYear;
  const eventFinish = eventEnd(event);

  if (eventFinish < currentRange[0]) {
    return shiftRangeWithinBounds([eventFinish - span, eventFinish], bounds);
  }

  return shiftRangeWithinBounds([eventStart, eventStart + span], bounds);
}

export function scaleRangeAroundCenter(
  range: TimeRange,
  factor: number,
  bounds: TimeRange,
): TimeRange {
  if (!Number.isFinite(factor) || factor <= 0) {
    return range;
  }

  const center = (range[0] + range[1]) / 2;
  const span = Math.max(range[1] - range[0], MIN_WINDOW_SPAN);
  const boundsSpan = Math.max(bounds[1] - bounds[0], MIN_WINDOW_SPAN);
  const nextSpan = Math.min(Math.max(span * factor, MIN_WINDOW_SPAN), boundsSpan);
  const half = nextSpan / 2;

  return shiftRangeWithinBounds([center - half, center + half], bounds);
}

export function findDynastyContainingYear(
  year: number,
  dynasties: Dynasty[],
): Dynasty | null {
  for (const dynasty of dynasties) {
    const end = dynasty.endYear ?? dynasty.startYear;
    if (year >= dynasty.startYear && year <= end) {
      return dynasty;
    }
  }
  return null;
}

export function findDynastyForRangeStart(
  range: TimeRange,
  dynasties: Dynasty[],
): Dynasty | null {
  const startYear = Math.min(range[0], range[1]);
  const containing = findDynastyContainingYear(startYear, dynasties);
  if (containing) {
    return containing;
  }

  let nearest: Dynasty | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const dynasty of dynasties) {
    const end = dynasty.endYear ?? dynasty.startYear;
    const distance =
      startYear < dynasty.startYear
        ? dynasty.startYear - startYear
        : startYear > end
          ? startYear - end
          : 0;
    if (distance < nearestDistance) {
      nearest = dynasty;
      nearestDistance = distance;
    }
  }
  return nearest;
}
