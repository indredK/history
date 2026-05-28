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
  selectedEventId: string | null;
  highlightedDynastyId: string | null;
  densityMode: TimelineDensityMode;
  currentTimeRange: [number, number] | null;
  expandedClusterId: string | null;

  setSelectedDynastyIds: (_dynastyIds: string[] | ((current: string[]) => string[])) => void;
  toggleSelectedDynastyId: (_dynastyId: string) => void;
  setSelectedEventTypes: (_eventTypes: string[]) => void;
  toggleSelectedEventType: (_eventType: string) => void;
  setKeyword: (_keyword: string) => void;
  setJumpRange: (_jumpRange: TimelineJumpRange | null) => void;
  setSelectedEventId: (_eventId: string | null) => void;
  setHighlightedDynastyId: (_dynastyId: string | null | ((current: string | null) => string | null)) => void;
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

export const useTimelineStore = create<TimelineState>((set) => ({
  ...defaultFilterState,
  selectedEventId: null,
  highlightedDynastyId: null,
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
  setSelectedEventId: (_eventId) => set({ selectedEventId: _eventId }),
  setHighlightedDynastyId: (_dynastyId) =>
    set((state) => ({
      highlightedDynastyId:
        typeof _dynastyId === 'function' ? _dynastyId(state.highlightedDynastyId) : _dynastyId,
    })),
  setDensityMode: (_mode) => set({ densityMode: _mode }),
  setCurrentTimeRange: (_range) => set({ currentTimeRange: _range }),
  setExpandedClusterId: (_clusterId) => set({ expandedClusterId: _clusterId }),

  clearFilters: () =>
    set({
      ...defaultFilterState,
      selectedEventId: null,
      highlightedDynastyId: null,
      expandedClusterId: null,
    }),

  resetViewState: () =>
    set({
      ...defaultFilterState,
      selectedEventId: null,
      highlightedDynastyId: null,
      currentTimeRange: null,
      expandedClusterId: null,
    }),
}));
