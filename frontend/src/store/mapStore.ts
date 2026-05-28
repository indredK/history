import { create } from 'zustand';
import type { Feature } from 'geojson';
import type { ViewportState } from '@/services/map/types';

export type HistoricalFocusMode = 'idle' | 'dynasty' | 'event' | 'playback';
export type PlaybackState = 'idle' | 'playing' | 'paused';
export type PlaybackSpeed = 'slow' | 'medium' | 'fast';

interface MapState extends ViewportState {
  bearing: number;
  pitch: number;
  
  // Feature selection
  selectedFeature: Feature | null;
  hoveredFeature: Feature | null;
  
  // Hover effects
  hoveredFeatureId: string | null;
  hoveredLayerType: 'admin' | 'dynasty' | null;
  
  // Layer controls - 基础行政区域层
  adminBoundaryVisible: boolean;
  adminBoundaryOpacity: number;
  
  // Layer controls - 历史朝代边界层
  dynastyBoundaryVisible: boolean;
  dynastyBoundaryOpacity: number;
  
  // Event markers
  eventMarkersVisible: boolean;

  // Historical focus
  historicalFocusMode: HistoricalFocusMode;
  selectedDynastyId: string | null;
  selectedEventId: string | null;
  focusYear: number | null;
  eventFocusRange: [number, number] | null;
  visibleRange: [number, number] | null;
  playheadYear: number | null;
  playbackState: PlaybackState;
  playbackSpeed: PlaybackSpeed;
  
  // Actions
  setLocation: (_lat: number, _lon: number, _zoom: number) => void;
  setViewport: (_viewport: Partial<ViewportState>) => void;
  setSelectedFeature: (_feature: Feature | null) => void;
  setHoveredFeature: (_feature: Feature | null) => void;
  setHoveredFeatureId: (_featureId: string | null, _layerType: 'admin' | 'dynasty' | null) => void;
  
  // 基础行政区域层控制
  toggleAdminBoundary: () => void;
  setAdminBoundaryOpacity: (_opacity: number) => void;
  
  // 历史朝代边界层控制
  toggleDynastyBoundary: () => void;
  setDynastyBoundaryOpacity: (_opacity: number) => void;
  
  // 事件标记控制
  toggleEventMarkers: () => void;

  // Historical timeline controls
  selectDynasty: (_dynastyId: string, _startYear: number) => void;
  selectEvent: (_eventId: string, _focusStartYear: number, _focusEndYear: number) => void;
  setFocusYear: (_year: number | null) => void;
  setVisibleRange: (_range: [number, number] | null) => void;
  setPlayheadYear: (_year: number | null) => void;
  setPlaybackSpeed: (_speed: PlaybackSpeed) => void;
  play: () => void;
  pause: () => void;
  stepPrevious: (_years?: number) => void;
  stepNext: (_years?: number) => void;
  clearHistoricalSelection: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Viewport state - 调整到测试区域中心
  latitude: 35,
  longitude: 110,
  zoom: 4,
  bearing: 0,
  pitch: 0,
  
  // Feature selection
  selectedFeature: null,
  hoveredFeature: null,
  
  // Hover effects
  hoveredFeatureId: null,
  hoveredLayerType: null,
  
  // Layer controls - 基础行政区域层
  adminBoundaryVisible: true,
  adminBoundaryOpacity: 0.3,
  
  // Layer controls - 历史朝代边界层  
  dynastyBoundaryVisible: true,
  dynastyBoundaryOpacity: 0.8,
  
  // Event markers
  eventMarkersVisible: true,

  // Historical focus
  historicalFocusMode: 'idle',
  selectedDynastyId: null,
  selectedEventId: null,
  focusYear: null,
  eventFocusRange: null,
  visibleRange: null,
  playheadYear: null,
  playbackState: 'idle',
  playbackSpeed: 'medium',
  
  // Actions
  setLocation: (_lat, _lon, _zoom) => 
    set({ latitude: _lat, longitude: _lon, zoom: _zoom }),
  
  setViewport: (_viewport) => 
    set((state) => ({ ...state, ..._viewport })),
  
  setSelectedFeature: (_feature) => 
    set({ selectedFeature: _feature }),
  
  setHoveredFeature: (_feature) => 
    set({ hoveredFeature: _feature }),
  
  setHoveredFeatureId: (_featureId: string | null, _layerType: 'admin' | 'dynasty' | null) =>
    set({ hoveredFeatureId: _featureId, hoveredLayerType: _layerType }),
  
  // 基础行政区域层控制
  toggleAdminBoundary: () => 
    set((state) => ({ adminBoundaryVisible: !state.adminBoundaryVisible })),
  
  setAdminBoundaryOpacity: (_opacity) => 
    set({ adminBoundaryOpacity: Math.max(0, Math.min(1, _opacity)) }),
  
  // 历史朝代边界层控制
  toggleDynastyBoundary: () => 
    set((state) => ({ dynastyBoundaryVisible: !state.dynastyBoundaryVisible })),
  
  setDynastyBoundaryOpacity: (_opacity) => 
    set({ dynastyBoundaryOpacity: Math.max(0, Math.min(1, _opacity)) }),
  
  // 事件标记控制
  toggleEventMarkers: () => 
    set((state) => ({ eventMarkersVisible: !state.eventMarkersVisible })),

  // Historical timeline controls
  selectDynasty: (_dynastyId, _startYear) =>
    set({
      historicalFocusMode: 'dynasty',
      selectedDynastyId: _dynastyId,
      selectedEventId: null,
      focusYear: _startYear,
      eventFocusRange: null,
      playheadYear: _startYear,
      playbackState: 'idle',
    }),

  selectEvent: (_eventId, _focusStartYear, _focusEndYear) =>
    set({
      historicalFocusMode: 'event',
      selectedEventId: _eventId,
      focusYear: _focusStartYear,
      eventFocusRange: [_focusStartYear, _focusEndYear],
      playheadYear: _focusStartYear,
      playbackState: 'idle',
    }),

  setFocusYear: (_year) =>
    set({ focusYear: _year }),

  setVisibleRange: (_range) =>
    set({ visibleRange: _range }),

  setPlayheadYear: (_year) =>
    set({ playheadYear: _year }),

  setPlaybackSpeed: (_speed) =>
    set({ playbackSpeed: _speed }),

  play: () =>
    set((state) => ({
      historicalFocusMode:
        state.selectedEventId || state.selectedDynastyId ? state.historicalFocusMode : 'playback',
      playbackState: 'playing',
    })),

  pause: () =>
    set({ playbackState: 'paused' }),

  stepPrevious: (_years = 1) =>
    set((state) => {
      const currentYear = state.playheadYear ?? state.focusYear;
      if (currentYear === null) return {};
      const nextYear = currentYear - _years;
      return {
        playheadYear: nextYear,
        focusYear: nextYear,
        historicalFocusMode:
          state.historicalFocusMode === 'idle' ? 'playback' : state.historicalFocusMode,
        playbackState: 'paused',
      };
    }),

  stepNext: (_years = 1) =>
    set((state) => {
      const currentYear = state.playheadYear ?? state.focusYear;
      if (currentYear === null) return {};
      const nextYear = currentYear + _years;
      return {
        playheadYear: nextYear,
        focusYear: nextYear,
        historicalFocusMode:
          state.historicalFocusMode === 'idle' ? 'playback' : state.historicalFocusMode,
        playbackState: 'paused',
      };
    }),

  clearHistoricalSelection: () =>
    set({
      historicalFocusMode: 'idle',
      selectedDynastyId: null,
      selectedEventId: null,
      focusYear: null,
      eventFocusRange: null,
      playheadYear: null,
      playbackState: 'idle',
    }),
}));
