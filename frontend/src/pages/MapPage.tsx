import { useCallback, useMemo } from 'react';
import { EChartsMapView } from '@/features/map/EChartsMapView';
import type { EChartsMapViewProps } from '@/features/map/EChartsMapView';
import { MapErrorBoundary } from '@/features/map/components/MapErrorBoundary';
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

  return (
    <MapErrorBoundary>
      <EChartsMapView
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
