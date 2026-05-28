import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { EChartsMap } from './components/EChartsMap';
import type { EChartsMapLayerVisibility } from './components/EChartsMap';
import type { ProvinceData } from '@/services/map/types';
import type { Event } from '@/services/timeline/types';
import type { Dynasty } from '@/services/culture/types';
import type { Place } from '@/services/map/types';
import { EChartsTimeline } from '@/features/timeline/components';
import { StateView } from '@/components/ui';
import { mapTimelineDemoService } from './demo/service';
import { resolveEventLocations } from './utils/resolveEventLocations';
import { useHistoricalPlayback } from './hooks/useHistoricalPlayback';
import type { HistoricalPlaybackOptions } from './hooks/useHistoricalPlayback';
import { usePerformanceTrace } from '@/utils/performance';
import type { HistoricalFocusMode, PlaybackState, PlaybackSpeed } from '@/store/mapStore';

// ── Props interface ──
export interface EChartsMapViewProps extends EChartsMapLayerVisibility {
  // ── Data (override internal loadBundle) ──
  events?: Event[];
  dynasties?: Dynasty[];
  places?: Place[];

  // ── Controlled state ──
  historicalFocusMode?: HistoricalFocusMode;
  selectedDynastyId?: string | null;
  selectedEventId?: string | null;
  focusYear?: number | null;
  playheadYear?: number | null;
  eventFocusRange?: [number, number] | null;
  playbackState?: PlaybackState;
  playbackSpeed?: PlaybackSpeed;

  // ── Initial state (used when uncontrolled) ──
  initialHistoricalFocusMode?: HistoricalFocusMode;
  initialSelectedDynastyId?: string | null;
  initialSelectedEventId?: string | null;
  initialFocusYear?: number | null;
  initialPlayheadYear?: number | null;
  initialEventFocusRange?: [number, number] | null;
  initialPlaybackState?: PlaybackState;
  initialPlaybackSpeed?: PlaybackSpeed;

  // ── Feature toggles ──
  showStatusOverlay?: boolean;    // default true
  showTimeline?: boolean;          // default true
  showProvincePanel?: boolean;     // default true
  minTimelineHeight?: number;      // default 220

  // ── Timeline props (forwarded to EChartsTimeline) ──
  timelineProps?: Record<string, unknown>;
  /** 是否在嵌入的时间轴中显示事件散点，默认 false（地图中时间轴以朝代为主） */
  showTimelineEvents?: boolean;

  // ── Callbacks ──
  onProvinceClick?: (name: string, data: ProvinceData | null) => void;
  onDynastySelect?: (dynastyId: string, startYear: number) => void;
  onFocusYearChange?: (year: number | null) => void;
  onPlayheadYearChange?: (year: number | null) => void;
  onPlaybackStateChange?: (state: PlaybackState) => void;
}

export function EChartsMapView({
  // ── Data ──
  events: eventsProp,
  dynasties: dynastiesProp,
  places: placesProp,

  // ── Controlled state ──
  historicalFocusMode: historicalFocusModeProp,
  selectedDynastyId: selectedDynastyIdProp,
  selectedEventId: selectedEventIdProp,
  focusYear: focusYearProp,
  playheadYear: playheadYearProp,
  eventFocusRange: eventFocusRangeProp,
  playbackState: playbackStateProp,
  playbackSpeed: playbackSpeedProp,

  // ── Initial state ──
  initialHistoricalFocusMode = 'idle',
  initialSelectedDynastyId = null,
  initialSelectedEventId = null,
  initialFocusYear = null,
  initialPlayheadYear = null,
  initialEventFocusRange = null,
  initialPlaybackState = 'idle',
  initialPlaybackSpeed = 'medium',

  // ── Layer visibility ──
  adminBoundaryVisible = true,
  adminBoundaryOpacity = 0.3,
  dynastyBoundaryVisible = true,
  dynastyBoundaryOpacity = 0.8,
  eventMarkersVisible = true,

  // ── Feature toggles ──
  showStatusOverlay = true,
  showTimeline = true,
  showProvincePanel = true,
  minTimelineHeight = 200,

  // ── Timeline props ──
  timelineProps,
  showTimelineEvents = false,

  // ── Callbacks ──
  onProvinceClick,
  onDynastySelect,
  onFocusYearChange,
  onPlayheadYearChange,
  onPlaybackStateChange,
}: EChartsMapViewProps) {
  usePerformanceTrace('map-page-mounted', []);

  // ── Province selection (always internal) ──
  const [selectedProvince, setSelectedProvince] = useState<{
    name: string;
    data: ProvinceData | null;
  } | null>(null);

  // ── Controlled/uncontrolled state ──
  const [_historicalFocusMode, _setHistoricalFocusMode] = useState(initialHistoricalFocusMode);
  const [_selectedDynastyId, _setSelectedDynastyId] = useState<string | null>(initialSelectedDynastyId);
  const [_selectedEventId, _setSelectedEventId] = useState<string | null>(initialSelectedEventId);
  const [_focusYear, _setFocusYear] = useState<number | null>(initialFocusYear);
  const [_playheadYear, _setPlayheadYear] = useState<number | null>(initialPlayheadYear);
  const [_eventFocusRange, _setEventFocusRange] = useState<[number, number] | null>(initialEventFocusRange);
  const [_playbackState, _setPlaybackState] = useState<PlaybackState>(initialPlaybackState);
  const [_playbackSpeed] = useState<PlaybackSpeed>(initialPlaybackSpeed);

  const historicalFocusMode = historicalFocusModeProp !== undefined ? historicalFocusModeProp : _historicalFocusMode;
  const selectedDynastyId = selectedDynastyIdProp !== undefined ? selectedDynastyIdProp : _selectedDynastyId;
  const selectedEventId = selectedEventIdProp !== undefined ? selectedEventIdProp : _selectedEventId;
  const focusYear = focusYearProp !== undefined ? focusYearProp : _focusYear;
  const playheadYear = playheadYearProp !== undefined ? playheadYearProp : _playheadYear;
  const eventFocusRange = eventFocusRangeProp !== undefined ? eventFocusRangeProp : _eventFocusRange;
  const playbackState = playbackStateProp !== undefined ? playbackStateProp : _playbackState;
  const playbackSpeed = playbackSpeedProp !== undefined ? playbackSpeedProp : _playbackSpeed;

  // ── State setters (with propagation) ──
  const setHistoricalFocusMode = useCallback((value: HistoricalFocusMode) => {
    if (historicalFocusModeProp === undefined) _setHistoricalFocusMode(value);
  }, [historicalFocusModeProp]);

  const setSelectedDynastyId = useCallback((value: string | null) => {
    if (selectedDynastyIdProp === undefined) _setSelectedDynastyId(value);
  }, [selectedDynastyIdProp]);

  const setSelectedEventId = useCallback((value: string | null) => {
    if (selectedEventIdProp === undefined) _setSelectedEventId(value);
  }, [selectedEventIdProp]);

  const setFocusYear = useCallback((value: number | null) => {
    if (focusYearProp === undefined) _setFocusYear(value);
    onFocusYearChange?.(value);
  }, [focusYearProp, onFocusYearChange]);

  const setPlayheadYear = useCallback((value: number | null) => {
    if (playheadYearProp === undefined) _setPlayheadYear(value);
    onPlayheadYearChange?.(value);
  }, [playheadYearProp, onPlayheadYearChange]);

  const setEventFocusRange = useCallback((value: [number, number] | null) => {
    if (eventFocusRangeProp === undefined) _setEventFocusRange(value);
  }, [eventFocusRangeProp]);

  const setPlaybackState = useCallback((value: PlaybackState) => {
    if (playbackStateProp === undefined) _setPlaybackState(value);
    onPlaybackStateChange?.(value);
  }, [playbackStateProp, onPlaybackStateChange]);

  // ── Actions (mirroring mapStore actions) ──
  const selectDynasty = useCallback((dynastyId: string, startYear: number) => {
    setHistoricalFocusMode('dynasty');
    setSelectedDynastyId(dynastyId);
    setSelectedEventId(null);
    setFocusYear(startYear);
    setEventFocusRange(null);
    setPlayheadYear(startYear);
    setPlaybackState('idle');
    onDynastySelect?.(dynastyId, startYear);
  }, [setHistoricalFocusMode, setSelectedDynastyId, setSelectedEventId, setFocusYear, setEventFocusRange, setPlayheadYear, setPlaybackState, onDynastySelect]);

  const pause = useCallback(() => {
    setPlaybackState('paused');
  }, [setPlaybackState]);

  // ── Data loading ──
  const hasExternalData = eventsProp !== undefined && dynastiesProp !== undefined;

  const {
    data: demoBundle,
    loading,
    error,
    refresh,
  } = useRequest(
    () => mapTimelineDemoService.loadBundle(),
    { ready: !hasExternalData },
  );

  const dynasties = useMemo(
    () => {
      if (dynastiesProp !== undefined) {
        return [...dynastiesProp].sort((a, b) => a.startYear - b.startYear);
      }
      return [...(demoBundle?.dynasties ?? [])].sort(
        (left, right) => left.startYear - right.startYear,
      );
    },
    [dynastiesProp, demoBundle?.dynasties],
  );

  const events = useMemo(
    () => {
      if (eventsProp !== undefined) {
        return [...eventsProp].sort((left, right) => {
          const leftEnd = left.endYear ?? left.startYear;
          const rightEnd = right.endYear ?? right.startYear;
          return left.startYear - right.startYear || leftEnd - rightEnd;
        });
      }
      return [...(demoBundle?.events ?? [])].sort((left, right) => {
        const leftEnd = left.endYear ?? left.startYear;
        const rightEnd = right.endYear ?? right.startYear;
        return left.startYear - right.startYear || leftEnd - rightEnd;
      });
    },
    [eventsProp, demoBundle?.events],
  );

  const places = useMemo(
    () => placesProp ?? demoBundle?.places ?? [],
    [placesProp, demoBundle?.places],
  );

  // ── Playback hook ──
  const playbackOptions: HistoricalPlaybackOptions = useMemo(() => ({
    selectedDynastyId,
    eventFocusRange,
    visibleRange: null,
    playheadYear,
    focusYear,
    playbackState,
    playbackSpeed,
    onPlayheadYearChange: setPlayheadYear,
    onFocusYearChange: setFocusYear,
    onPause: pause,
  }), [
    selectedDynastyId, eventFocusRange, playheadYear, focusYear,
    playbackState, playbackSpeed, setPlayheadYear, setFocusYear, pause,
  ]);

  useHistoricalPlayback(dynasties, playbackOptions);

  // ── Default dynasty selection on first load ──
  useEffect(() => {
    if (loading || dynasties.length === 0) return;
    if (hasExternalData && selectedDynastyIdProp !== undefined) return;
    if (selectedDynastyId || selectedEventId || focusYear !== null) return;
    const defaultDynasty = dynasties[0];
    if (defaultDynasty) {
      selectDynasty(defaultDynasty.id, defaultDynasty.startYear);
    }
  }, [dynasties, focusYear, loading, selectDynasty, selectedDynastyId, selectedEventId, hasExternalData, selectedDynastyIdProp]);

  // ── Boundary snapshot ──
  const boundaryYear = playheadYear ?? focusYear;
  const { data: boundarySnapshot, loading: boundaryLoading } = useRequest(
    async () => {
      if (boundaryYear === null) {
        return { boundary: null, mapping: null };
      }
      return mapTimelineDemoService.getBoundarySnapshotByYear(boundaryYear);
    },
    {
      refreshDeps: [boundaryYear],
    },
  );
  const activeBoundaryName = boundarySnapshot?.mapping?.name ?? null;

  // ── Derived data ──
  const selectedDynasty = useMemo(
    () => dynasties.find((item) => item.id === selectedDynastyId) ?? null,
    [dynasties, selectedDynastyId],
  );
  const selectedEvent = useMemo(
    () => events.find((item) => item.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );
  const resolvedEventLocations = useMemo(
    () => resolveEventLocations(selectedEvent, places),
    [places, selectedEvent],
  );

  useEffect(() => {
    setSelectedProvince(null);
  }, [selectedDynastyId, selectedEventId]);

  // ── Handlers ──
  const handleProvinceClick = useCallback((name: string, data: ProvinceData | null) => {
    setSelectedProvince({ name, data });
    onProvinceClick?.(name, data);
  }, [onProvinceClick]);

  // ── Loading / error states ──
  if (!hasExternalData && loading) {
    return <StateView mode="loading" title="正在加载地图联动演示数据..." minHeight="100%" />;
  }

  if (!hasExternalData && (error || !demoBundle)) {
    return (
      <StateView
        mode="error"
        title="地图联动演示数据加载失败"
        description={error instanceof Error ? error.message : '请稍后重试'}
        actionLabel="重试"
        onAction={refresh}
        minHeight="100%"
      />
    );
  }

  // ── Render ──
  return (
    <div
      className="map-container glass-card"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        border: 'var(--app-panel-border)',
        borderLeft: '4px solid rgba(25, 118, 210, 0.8)',
        borderRadius: 'var(--panel-radius)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
        backdropFilter: 'blur(var(--glass-blur-light, 12px))',
        WebkitBackdropFilter: 'blur(var(--glass-blur-light, 12px))',
        background: 'var(--app-panel-bg)',
        boxShadow: 'var(--app-panel-shadow-lg)',
      }}
    >
      <EChartsMap
        width="100%"
        height="100%"
        onProvinceClick={handleProvinceClick}
        historicalBoundary={boundarySnapshot?.boundary ?? null}
        historicalBoundaryName={activeBoundaryName}
        eventPlaces={resolvedEventLocations.matchedPlaces}
        loadingHistoricalBoundary={boundaryLoading}
        adminBoundaryVisible={adminBoundaryVisible}
        adminBoundaryOpacity={adminBoundaryOpacity}
        dynastyBoundaryVisible={dynastyBoundaryVisible}
        dynastyBoundaryOpacity={dynastyBoundaryOpacity}
        eventMarkersVisible={eventMarkersVisible}
      />

      {/* ── Status overlay ── */}
      {showStatusOverlay && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            top: 18,
            left: 18,
            zIndex: 110,
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(var(--glass-surface-rgb), 0.52)',
            border: '1px solid var(--theme-glass-border)',
            backdropFilter: 'blur(var(--glass-card-blur, 12px))',
            WebkitBackdropFilter: 'blur(var(--glass-card-blur, 12px))',
            boxShadow: 'var(--glass-shadow-sm, 0 4px 12px rgba(0, 0, 0, 0.12))',
            minWidth: '220px',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
              {selectedEvent?.title ?? selectedDynasty?.name ?? '近现代演示'}
            </div>
            <div>
              模式：
              {historicalFocusMode === 'event'
                ? '事件时间段'
                : historicalFocusMode === 'dynasty'
                  ? '朝代起始疆域'
                  : '播放/空闲'}
            </div>
            <div>地图年份：{boundaryYear ?? '-'}</div>
            <div>疆域阶段：{activeBoundaryName ?? '暂无疆域快照'}</div>
            {selectedEvent && eventFocusRange && (
              <div>事件范围：{eventFocusRange[0]} - {eventFocusRange[1]}</div>
            )}
            {selectedEvent && resolvedEventLocations.unmatchedNames.length > 0 && (
              <div>未匹配地点：{resolvedEventLocations.unmatchedNames.join(' / ')}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Embedded timeline ── */}
      {showTimeline && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 100,
        }}>
          <EChartsTimeline
            dynastiesData={dynasties}
            eventsData={events}
            minHeight={minTimelineHeight}
            showEventPoints={showTimelineEvents}
            {...(timelineProps ?? {})}
          />
        </div>
      )}

      {/* ── Province info panel ── */}
      {showProvincePanel && selectedProvince && selectedProvince.data && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            top: 24,
            right: 20,
            background: 'var(--app-panel-bg)',
            backdropFilter: 'blur(var(--glass-card-blur, 12px))',
            WebkitBackdropFilter: 'blur(var(--glass-card-blur, 12px))',
            padding: '16px',
            borderRadius: '14px',
            border: 'var(--app-panel-border)',
            boxShadow: 'var(--app-panel-shadow-md)',
            minWidth: '200px',
            zIndex: 100,
            transition: 'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              {selectedProvince.name}
            </h3>
            <button
              onClick={() => setSelectedProvince(null)}
              className="glass-button-icon"
              style={{
                background: 'rgba(var(--glass-surface-rgb), 0.4)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid var(--theme-glass-border-heavy)',
                borderRadius: 'var(--glass-radius-full, 9999px)',
                cursor: 'pointer',
                fontSize: '18px',
                color: 'var(--color-text-secondary)',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--glass-duration-hover, 150ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            <p style={{
              margin: '8px 0',
              padding: '8px 12px',
              background: 'rgba(var(--glass-surface-rgb), 0.4)',
              borderRadius: 'var(--glass-radius-sm, 8px)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}>
              <span style={{ color: 'var(--color-text-tertiary)' }}>数值：</span>
              {selectedProvince.data.value}
            </p>
            <p style={{
              margin: '8px 0',
              padding: '8px 12px',
              background: 'rgba(var(--glass-surface-rgb), 0.4)',
              borderRadius: 'var(--glass-radius-sm, 8px)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}>
              <span style={{ color: 'var(--color-text-tertiary)' }}>行政代码：</span>
              {selectedProvince.data.adcode || '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
