import type { Dynasty } from '@/services/culture/types';

export type TimelineRange = [number, number];

export function buildDynastyFocusRange(
  dynasty: Dynasty | null | undefined,
  minPadding = 40,
): TimelineRange | null {
  if (!dynasty) {
    return null;
  }

  const start = dynasty.startYear;
  const end = dynasty.endYear ?? dynasty.startYear;
  const span = Math.max(end - start, 1);
  const padding = Math.max(minPadding, Math.round(span * 0.12));

  return [start - padding, end + padding];
}

interface FormatTimelineYearOptions {
  short?: boolean | undefined;
}

export function formatTimelineYear(
  year: number,
  options: FormatTimelineYearOptions = {},
): string {
  const normalizedYear = Math.round(year);
  const absoluteYear = Math.abs(normalizedYear);

  if (normalizedYear === 0) {
    return options.short ? '元年' : '公元元年';
  }

  if (options.short) {
    return normalizedYear < 0 ? `前${absoluteYear}` : `${normalizedYear}`;
  }

  return normalizedYear < 0
    ? `公元前${absoluteYear}年`
    : `公元${normalizedYear}年`;
}

export function formatTimelineRange(range: TimelineRange): string {
  return `${formatTimelineYear(range[0])} - ${formatTimelineYear(range[1])}`;
}

export function findDynastyByYear(
  year: number,
  dynasties: Dynasty[],
): Dynasty | null {
  let best: Dynasty | null = null;
  let bestDistance = Infinity;
  for (const dynasty of dynasties) {
    const start = dynasty.startYear;
    const end = dynasty.endYear ?? dynasty.startYear;
    if (year >= start && year <= end) {
      return dynasty;
    }
    const distance = year < start ? start - year : year - end;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = dynasty;
    }
  }
  return best;
}
