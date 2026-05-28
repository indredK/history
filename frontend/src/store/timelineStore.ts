import { create } from 'zustand';

export type TimelineDensityMode = 'auto' | 'major-only' | 'all';

export interface TimelineJumpRange {
  startYear: number;
  endYear: number;
}

interface TimelineState {
  selectedDynastyIds: string[];
  selectedEventTypes: string[];
  keyword: string;
  jumpRange: TimelineJumpRange | null;
  densityMode: TimelineDensityMode;
  currentTimeRange: [number, number] | null;
  expandedClusterId: string | null;

  setSelectedDynastyIds: (_dynastyIds: string[] | ((current: string[]) => string[])) => void;
  toggleSelectedDynastyId: (_dynastyId: string) => void;
  setSelectedEventTypes: (_eventTypes: string[]) => void;
  toggleSelectedEventType: (_eventType: string) => void;
  setKeyword: (_keyword: string) => void;
  setJumpRange: (_jumpRange: TimelineJumpRange | null) => void;
  setDensityMode: (_mode: TimelineDensityMode) => void;
  setCurrentTimeRange: (_range: [number, number] | null) => void;
  setExpandedClusterId: (_clusterId: string | null) => void;
  clearFilters: () => void;
  resetViewState: () => void;
}

const defaultFilterState = {
  selectedDynastyIds: [],
  selectedEventTypes: [],
  keyword: '',
  jumpRange: null,
  densityMode: 'auto' as TimelineDensityMode,
};

function isSameRange(
  left: [number, number] | null,
  right: [number, number] | null,
  tolerance = 0.5,
) {
  if (!left || !right) {
    return left === right;
  }

  return Math.abs(left[0] - right[0]) <= tolerance && Math.abs(left[1] - right[1]) <= tolerance;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  ...defaultFilterState,
  currentTimeRange: null,
  expandedClusterId: null,

  setSelectedDynastyIds: (_dynastyIds) =>
    set((state) => ({
      selectedDynastyIds:
        typeof _dynastyIds === 'function' ? _dynastyIds(state.selectedDynastyIds) : _dynastyIds,
    })),
  toggleSelectedDynastyId: (_dynastyId) =>
    set((state) => ({
      selectedDynastyIds: state.selectedDynastyIds.includes(_dynastyId)
        ? state.selectedDynastyIds.filter((id) => id !== _dynastyId)
        : [...state.selectedDynastyIds, _dynastyId],
    })),

  setSelectedEventTypes: (_eventTypes) => set({ selectedEventTypes: _eventTypes }),
  toggleSelectedEventType: (_eventType) =>
    set((state) => ({
      selectedEventTypes: state.selectedEventTypes.includes(_eventType)
        ? state.selectedEventTypes.filter((type) => type !== _eventType)
        : [...state.selectedEventTypes, _eventType],
    })),

  setKeyword: (_keyword) => set({ keyword: _keyword }),
  setJumpRange: (_jumpRange) => set({ jumpRange: _jumpRange }),
  setDensityMode: (_mode) => set({ densityMode: _mode }),
  setCurrentTimeRange: (_range) =>
    set((state) => (isSameRange(state.currentTimeRange, _range) ? state : { currentTimeRange: _range })),
  setExpandedClusterId: (_clusterId) => set({ expandedClusterId: _clusterId }),

  clearFilters: () =>
    set({
      ...defaultFilterState,
      expandedClusterId: null,
    }),

  resetViewState: () =>
    set({
      ...defaultFilterState,
      currentTimeRange: null,
      expandedClusterId: null,
    }),
}));
