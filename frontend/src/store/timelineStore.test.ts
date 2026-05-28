import { beforeEach, describe, expect, it } from 'vitest';
import { useTimelineStore } from './timelineStore';

describe('timelineStore', () => {
  beforeEach(() => {
    useTimelineStore.getState().resetViewState();
  });

  it('默认使用空筛选与自动密度模式', () => {
    const state = useTimelineStore.getState();
    expect(state.selectedDynastyIds).toEqual([]);
    expect(state.selectedEventTypes).toEqual([]);
    expect(state.keyword).toBe('');
    expect(state.jumpRange).toBeNull();
    expect(state.densityMode).toBe('auto');
  });

  it('支持切换朝代和事件类型筛选', () => {
    const store = useTimelineStore.getState();
    store.toggleSelectedDynastyId('tang');
    store.toggleSelectedEventType('战争');

    let state = useTimelineStore.getState();
    expect(state.selectedDynastyIds).toEqual(['tang']);
    expect(state.selectedEventTypes).toEqual(['战争']);

    store.toggleSelectedDynastyId('tang');
    store.toggleSelectedEventType('战争');

    state = useTimelineStore.getState();
    expect(state.selectedDynastyIds).toEqual([]);
    expect(state.selectedEventTypes).toEqual([]);
  });

  it('支持设置搜索词与跳转区间', () => {
    const store = useTimelineStore.getState();
    store.setKeyword('赤壁');
    store.setJumpRange({ startYear: 200, endYear: 300 });

    const state = useTimelineStore.getState();
    expect(state.keyword).toBe('赤壁');
    expect(state.jumpRange).toEqual({ startYear: 200, endYear: 300 });
  });

  it('clearFilters 会清空筛选但保留当前视图区间', () => {
    const store = useTimelineStore.getState();
    store.setSelectedDynastyIds(['ming']);
    store.setSelectedEventTypes(['政治']);
    store.setKeyword('变法');
    store.setJumpRange({ startYear: 1000, endYear: 1200 });
    store.setCurrentTimeRange([1000, 1200]);

    store.clearFilters();

    const state = useTimelineStore.getState();
    expect(state.selectedDynastyIds).toEqual([]);
    expect(state.selectedEventTypes).toEqual([]);
    expect(state.keyword).toBe('');
    expect(state.jumpRange).toBeNull();
    expect(state.currentTimeRange).toEqual([1000, 1200]);
  });
});
