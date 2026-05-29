import { useCallback, useMemo } from 'react';
import { useRequest } from 'ahooks';
import { EChartsMapView } from '@/features/map/EChartsMapView';
import type { EChartsMapViewProps } from '@/features/map/EChartsMapView';
import { MapErrorBoundary } from '@/features/map/components/MapErrorBoundary';
import { StateView } from '@/components/ui';
import { getDynasties, getEvents, getPlaces } from '@/services/dataClient';
import { useMapStore } from '@/store';
function MapPage() {
  const {
    historicalFocusMode,
    selectedDynastyId,
    selectedEventId,
    focusYear,
    playheadYear,
    eventFocusRange,
    playbackState,
    playbackSpeed,
    adminBoundaryVisible,
    adminBoundaryOpacity,
    dynastyBoundaryVisible,
    dynastyBoundaryOpacity,
    eventMarkersVisible,
    selectDynasty,
    setFocusYear,
    setPlayheadYear,
    pause,
  } = useMapStore();

  const onDynastySelect: NonNullable<EChartsMapViewProps['onDynastySelect']> = useCallback(
    (dynastyId, startYear) => selectDynasty(dynastyId, startYear),
    [selectDynasty],
  );

  const onFocusYearChange: NonNullable<EChartsMapViewProps['onFocusYearChange']> = useCallback(
    (year) => setFocusYear(year),
    [setFocusYear],
  );

  const onPlayheadYearChange: NonNullable<EChartsMapViewProps['onPlayheadYearChange']> = useCallback(
    (year) => setPlayheadYear(year),
    [setPlayheadYear],
  );

  const onPlaybackStateChange: NonNullable<EChartsMapViewProps['onPlaybackStateChange']> = useCallback(
    (state) => {
      if (state === 'paused') pause();
    },
    [pause],
  );

  // ── Derive initial values from store (captured on mount) ──
  const initialFocusYear = useMemo(() => focusYear, []);
  const initialSelectedDynastyId = useMemo(() => selectedDynastyId, []);
  const initialPlayheadYear = useMemo(() => playheadYear, []);
  const initialEventFocusRange = useMemo(() => eventFocusRange, []);
  const initialHistoricalFocusMode = useMemo(() => historicalFocusMode, []);
  const initialPlaybackState = useMemo(() => playbackState, []);
  const initialPlaybackSpeed = useMemo(() => playbackSpeed, []);

  const {
    data,
    loading,
    error,
    refresh,
  } = useRequest(async () => {
    const [eventsResult, dynastiesResult, placesResult] = await Promise.all([
      getEvents(),
      getDynasties(),
      getPlaces(),
    ]);

    return {
      events: eventsResult.data,
      dynasties: dynastiesResult.data,
      places: placesResult.data,
    };
  });

  if (loading) {
    return (
      <StateView
        mode="loading"
        title="正在加载地图数据..."
        description="正在接入完整时间轴与地图资源。"
        minHeight="100%"
      />
    );
  }

  if (error || !data) {
    return (
      <StateView
        mode="error"
        title="地图数据加载失败"
        description={error instanceof Error ? error.message : '请稍后重试'}
        actionLabel="重试"
        onAction={refresh}
        minHeight="100%"
      />
    );
  }

  return (
    <MapErrorBoundary>
      <EChartsMapView
        events={data.events}
        dynasties={data.dynasties}
        places={data.places}
        // Controlled state (synced to store)
        historicalFocusMode={historicalFocusMode}
        selectedDynastyId={selectedDynastyId}
        selectedEventId={selectedEventId}
        focusYear={focusYear}
        playheadYear={playheadYear}
        eventFocusRange={eventFocusRange}
        playbackState={playbackState}
        playbackSpeed={playbackSpeed}
        // Initial state (from store defaults, captured on mount)
        initialHistoricalFocusMode={initialHistoricalFocusMode}
        initialSelectedDynastyId={initialSelectedDynastyId}
        initialFocusYear={initialFocusYear}
        initialPlayheadYear={initialPlayheadYear}
        initialEventFocusRange={initialEventFocusRange}
        initialPlaybackState={initialPlaybackState}
        initialPlaybackSpeed={initialPlaybackSpeed}
        // Layer visibility
        adminBoundaryVisible={adminBoundaryVisible}
        adminBoundaryOpacity={adminBoundaryOpacity}
        dynastyBoundaryVisible={dynastyBoundaryVisible}
        dynastyBoundaryOpacity={dynastyBoundaryOpacity}
        eventMarkersVisible={eventMarkersVisible}
        // Callbacks (→ store)
        onDynastySelect={onDynastySelect}
        onFocusYearChange={onFocusYearChange}
        onPlayheadYearChange={onPlayheadYearChange}
        onPlaybackStateChange={onPlaybackStateChange}
      />
    </MapErrorBoundary>
  );
}

export default MapPage;
