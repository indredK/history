import { describe, it, expect } from 'vitest';
import { MockProvider } from '../mockProvider';
import type { Event } from '../../types/models';

describe('MockProvider', () => {
  it('returns events array', async () => {
    const res = await MockProvider.getEvents();
    const items = Array.isArray(res.data) ? res.data : res.data.items;
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it('filters events by year range', async () => {
    const res = await MockProvider.getEventsByRange(750, 760);
    const years = (res.data as Event[]).map((e: Event) => [e.startYear, e.endYear ?? e.startYear]);
    for (const [start, end] of years) {
      expect(start).toBeLessThanOrEqual(760);
      expect(end).toBeGreaterThanOrEqual(750);
    }
  });
});
