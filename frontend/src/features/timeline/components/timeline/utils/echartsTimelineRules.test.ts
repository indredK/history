import { describe, expect, it } from 'vitest';
import type { Dynasty } from '@/services/culture/types';
import type { Event } from '@/services/timeline/types';
import {
  buildDefaultWindowRange,
  expandRangeAroundDynasty,
  eventEnd,
  findDynastyContainingYear,
  findDynastyForRangeStart,
  focusRangeToDynasty,
  focusRangeToDynastyWithContext,
  focusRangeToDynastyWithPadding,
  getHighlightedDynastyIdsForRange,
  moveRangeToDynasty,
  moveRangeToEvent,
} from './echartsTimelineRules';

function makeDynasty(overrides: Partial<Dynasty>): Dynasty {
  return {
    id: overrides.id ?? 'dynasty',
    name: overrides.name ?? 'Dynasty',
    startYear: overrides.startYear ?? 0,
    ...(overrides.endYear !== undefined ? { endYear: overrides.endYear } : {}),
  };
}

function makeEvent(overrides: Partial<Event>): Event {
  return {
    id: overrides.id ?? 'event',
    title: overrides.title ?? 'Event',
    startYear: overrides.startYear ?? 0,
    ...(overrides.endYear !== undefined ? { endYear: overrides.endYear } : {}),
  };
}

describe('echartsTimelineRules', () => {
  it('highlights the dynasties touched by the window start, end, and middle span', () => {
    const dynasties = [
      makeDynasty({ id: 'qin', name: '秦', startYear: -221, endYear: -206 }),
      makeDynasty({ id: 'han', name: '汉', startYear: -206, endYear: 220 }),
      makeDynasty({ id: 'jin', name: '晋', startYear: 266, endYear: 420 }),
      makeDynasty({ id: 'sui', name: '隋', startYear: 581, endYear: 618 }),
    ];

    expect(getHighlightedDynastyIdsForRange([-200, 600], dynasties)).toEqual([
      'han',
      'jin',
      'sui',
    ]);
  });

  it('focuses the slider range to the exact dynasty start and end', () => {
    const dynasty = makeDynasty({ id: 'tang', name: '唐', startYear: 618, endYear: 907 });

    expect(focusRangeToDynasty(dynasty, [-500, 1200])).toEqual([618, 907]);
  });

  it('focuses to a dynasty range with small context padding on both sides', () => {
    const dynasty = makeDynasty({ id: 'tang', name: '唐', startYear: 618, endYear: 907 });

    expect(focusRangeToDynastyWithPadding(dynasty, [-500, 1200])).toEqual([595, 930]);
  });

  it('focuses to a dynasty with broader surrounding context while keeping it centered', () => {
    const dynasty = makeDynasty({ id: 'tang', name: '唐', startYear: 618, endYear: 907 });

    expect(focusRangeToDynastyWithContext(dynasty, [-500, 1200])).toEqual([517, 1008]);
  });

  it('aligns an oversized window to the dynasty start without changing the span', () => {
    const dynasty = makeDynasty({ id: 'tang', name: '唐', startYear: 618, endYear: 907 });

    expect(moveRangeToDynasty([0, 400], dynasty, [-500, 1200])).toEqual([618, 1018]);
    expect(moveRangeToDynasty([900, 1300], dynasty, [-500, 1300])).toEqual([618, 1018]);
  });

  it('moves a smaller window fully inside a longer dynasty from the left side', () => {
    const dynasty = makeDynasty({ id: 'han', name: '汉', startYear: -206, endYear: 220 });

    expect(moveRangeToDynasty([-400, -250], dynasty, [-500, 1000])).toEqual([-206, -56]);
  });

  it('moves a smaller window fully inside a longer dynasty from the right side', () => {
    const dynasty = makeDynasty({ id: 'han', name: '汉', startYear: -206, endYear: 220 });

    expect(moveRangeToDynasty([100, 250], dynasty, [-500, 1000])).toEqual([70, 220]);
  });

  it('keeps the window unchanged when it is already fully inside the dynasty range', () => {
    const dynasty = makeDynasty({ id: 'tang', name: '唐', startYear: 618, endYear: 907 });

    expect(moveRangeToDynasty([650, 850], dynasty, [-500, 1200])).toEqual([650, 850]);
  });

  it('expands a dynasty to nearly fill the band while preserving a small context', () => {
    const dynasty = makeDynasty({ id: 'tang', name: '唐', startYear: 618, endYear: 907 });

    expect(expandRangeAroundDynasty(dynasty, [-500, 1200])).toEqual([595, 930]);
  });

  it('brings an out-of-window event into view without changing the span', () => {
    const event = makeEvent({ id: 'evt', title: 'Battle', startYear: 755, endYear: 763 });

    expect(eventEnd(event)).toBe(763);
    expect(moveRangeToEvent([0, 100], event, [-500, 1200])).toEqual([755, 855]);
    expect(moveRangeToEvent([900, 1000], event, [-500, 1200])).toEqual([663, 763]);
  });

  it('builds a deterministic default window from the full bounds range', () => {
    expect(buildDefaultWindowRange([-1000, 1000])).toEqual([-1000, -600]);
    expect(buildDefaultWindowRange([600, 900])).toEqual([600, 660]);
  });

  it('finds the dynasty whose span contains a given year', () => {
    const dynasties = [
      makeDynasty({ id: 'qin', startYear: -221, endYear: -206 }),
      makeDynasty({ id: 'han', startYear: -206, endYear: 220 }),
      makeDynasty({ id: 'tang', startYear: 618, endYear: 907 }),
    ];

    expect(findDynastyContainingYear(100, dynasties)?.id).toBe('han');
    expect(findDynastyContainingYear(700, dynasties)?.id).toBe('tang');
    expect(findDynastyContainingYear(400, dynasties)).toBeNull();
  });

  it('picks the dynasty at the window start, falling back to the nearest one', () => {
    const dynasties = [
      makeDynasty({ id: 'qin', startYear: -221, endYear: -206 }),
      makeDynasty({ id: 'han', startYear: -206, endYear: 220 }),
      makeDynasty({ id: 'tang', startYear: 618, endYear: 907 }),
    ];

    expect(findDynastyForRangeStart([-200, 100], dynasties)?.id).toBe('han');
    expect(findDynastyForRangeStart([700, 1000], dynasties)?.id).toBe('tang');
    expect(findDynastyForRangeStart([400, 700], dynasties)?.id).toBe('han');
    expect(findDynastyForRangeStart([-500, -250], dynasties)?.id).toBe('qin');
  });
});
