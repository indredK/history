import { describe, expect, it } from 'vitest';
import {
  buildTimelineDynastyClusters,
  buildTimelineYearClusters,
  deriveTimelineEvents,
  filterTimelineEvents,
  shouldUseClusterMode,
  shouldUseMajorOnlyMode,
} from './timelineFilters';

const sourceEvents = [
  { id: '1', title: '统一', startYear: -221, description: '秦统一六国', eventType: 'political', dynastyId: 'qin', demoPriority: 10 },
  { id: '2', title: '焚书坑儒', startYear: -213, description: '思想控制', eventType: 'political', dynastyId: 'qin', demoPriority: 6 },
  { id: '3', title: '赤壁之战', startYear: 208, description: '三国著名战役', eventType: 'war', dynastyId: 'han', demoPriority: 10 },
  { id: '4', title: '蔡伦改进造纸术', startYear: 105, description: '造纸术发展', eventType: 'technology', dynastyId: 'han', demoPriority: 7 },
  { id: '5', title: '同年事件A', startYear: 618, description: 'A', eventType: 'political', dynastyId: 'tang', demoPriority: 9 },
  { id: '6', title: '同年事件B', startYear: 618, description: 'B', eventType: 'political', dynastyId: 'tang', demoPriority: 8 },
];

describe('timelineFilters', () => {
  it('derives normalized category, major flag, and search text', () => {
    const [first] = deriveTimelineEvents(sourceEvents as never);
    expect(first.normalizedCategory).toBe('政治');
    expect(first.isMajor).toBe(true);
    expect(first.searchText).toContain('统一');
  });

  it('filters by dynasty, type, keyword, and jump range', () => {
    const events = deriveTimelineEvents(sourceEvents as never);
    const result = filterTimelineEvents(events, {
      selectedDynastyIds: ['han'],
      selectedEventTypes: ['战争'],
      keyword: '赤壁',
      jumpRange: { startYear: 200, endYear: 300 },
    });

    expect(result.map((event) => event.id)).toEqual(['3']);
  });

  it('builds year clusters for multiple events in the same year and category', () => {
    const events = deriveTimelineEvents(sourceEvents as never);
    const clusters = buildTimelineYearClusters(events);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.year).toBe(618);
    expect(clusters[0]?.events).toHaveLength(2);
  });

  it('builds dynasty clusters for dense dynasty buckets', () => {
    const events = deriveTimelineEvents([
      ...sourceEvents,
      { id: '7', title: '密集1', startYear: 620, eventType: 'political', dynastyId: 'tang', demoPriority: 5 },
      { id: '8', title: '密集2', startYear: 622, eventType: 'political', dynastyId: 'tang', demoPriority: 5 },
    ] as never);
    const clusters = buildTimelineDynastyClusters(events, [
      { id: 'tang', name: '唐', startYear: 618, endYear: 907 },
    ]);

    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters[0]?.dynastyId).toBe('tang');
  });

  it('switches to major-only automatically on wide ranges', () => {
    expect(shouldUseMajorOnlyMode('auto', [-500, 500])).toBe(true);
    expect(shouldUseMajorOnlyMode('auto', [600, 700])).toBe(false);
    expect(shouldUseMajorOnlyMode('major-only', [600, 700])).toBe(true);
  });

  it('enables cluster mode on medium-to-wide windows', () => {
    expect(shouldUseClusterMode([-500, 500])).toBe(true);
    expect(shouldUseClusterMode([600, 700])).toBe(false);
  });
});
