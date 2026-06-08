import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { useRequest } from 'ahooks';
import { StateView } from '@/components/ui';
import { EChartsMapView } from '@/features/map/EChartsMapView';
import type { EChartsMapViewProps } from '@/features/map/EChartsMapView';
import { MapErrorBoundary } from '@/features/map/components/MapErrorBoundary';
import { EChartsTimeline } from '@/features/timeline/components';
import {
  EVENT_TYPE_LABELS,
  getTimelineEventCategories,
} from '@/features/timeline/utils/timelineFilters';
import { formatTimelineYear } from '@/features/timeline/utils/dynastyUtils';
import { getDynasties, getEvents, getPlaces } from '@/services/dataClient';
import type { Dynasty } from '@/services/culture/types';
import type { Event } from '@/services/timeline/types';
import type { Place } from '@/services/map/types';
import { useMapStore } from '@/store';
import './MapWorkbench.scss';

const MAP_STAGE_STYLE = { '--map-right-inset': '24px' } as CSSProperties;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} 加载超时`));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

function formatYearLabel(year: number | null) {
  if (year === null) {
    return '未锁定';
  }

  return formatTimelineYear(year);
}

function parseOptionalYear(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed !== 0 ? parsed : null;
}

export function MapWorkbench() {
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
    play,
    stepPrevious,
    stepNext,
    setPlaybackSpeed,
    setVisibleRange,
    toggleAdminBoundary,
    toggleDynastyBoundary,
    toggleEventMarkers,
    clearHistoricalSelection,
  } = useMapStore();

  const [keyword, setKeyword] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(true);

  const onDynastySelect: NonNullable<EChartsMapViewProps['onDynastySelect']> = useCallback(
    (dynastyId, year) => selectDynasty(dynastyId, year),
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
      if (state === 'paused') {
        pause();
      }
    },
    [pause],
  );

  const { data, loading, error, refresh } = useRequest(async () => {
    const [eventsResult, dynastiesResult, placesResult] = await Promise.allSettled([
      withTimeout(getEvents(), 4000, '事件数据'),
      withTimeout(getDynasties(), 4000, '朝代数据'),
      withTimeout(getPlaces(), 4000, '地点数据'),
    ]);

    const events = eventsResult.status === 'fulfilled' ? (eventsResult.value as { data: Event[] }).data : [];
    const dynasties = dynastiesResult.status === 'fulfilled' ? (dynastiesResult.value as { data: Dynasty[] }).data : [];
    const places = placesResult.status === 'fulfilled' ? (placesResult.value as { data: Place[] }).data : [];

    const failures = [
      eventsResult.status === 'rejected' ? eventsResult.reason : null,
      dynastiesResult.status === 'rejected' ? dynastiesResult.reason : null,
      placesResult.status === 'rejected' ? placesResult.reason : null,
    ].filter(Boolean);

    if (failures.length > 0) {
      console.warn('MapWorkbench 部分数据降级加载:', failures);
    }

    if (dynasties.length === 0 && places.length === 0 && events.length === 0 && failures.length > 0) {
      throw failures[0] instanceof Error ? failures[0] : new Error('地图工作台数据加载失败');
    }

    return {
      events,
      dynasties,
      places,
    };
  });

  const eventTypes = useMemo(() => {
    const types = new Set<string>();
    for (const event of data?.events ?? []) {
      for (const category of getTimelineEventCategories(event)) {
        types.add(category);
      }
    }
    return EVENT_TYPE_LABELS.filter((label) => types.has(label));
  }, [data?.events]);

  const filterBounds = useMemo(() => {
    const dynasties = data?.dynasties ?? [];
    if (dynasties.length === 0) {
      return { earliestYear: '', latestYear: '' };
    }

    return {
      earliestYear: String(Math.min(...dynasties.map((dynasty: Dynasty) => dynasty.startYear))),
      latestYear: String(
        Math.max(...dynasties.map((dynasty: Dynasty) => dynasty.endYear ?? dynasty.startYear)),
      ),
    };
  }, [data?.dynasties]);

  const filteredEvents = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const rawStartBoundary = parseOptionalYear(startYear);
    const rawEndBoundary = parseOptionalYear(endYear);
    const startBoundary =
      rawStartBoundary !== null && rawEndBoundary !== null
        ? Math.min(rawStartBoundary, rawEndBoundary)
        : rawStartBoundary;
    const endBoundary =
      rawStartBoundary !== null && rawEndBoundary !== null
        ? Math.max(rawStartBoundary, rawEndBoundary)
        : rawEndBoundary;

    return (data?.events ?? []).filter((event: Event) => {
      const eventCategories = getTimelineEventCategories(event);
      const eventEnd = event.endYear ?? event.startYear;
      const haystack = [event.title, event.description, ...(event.rawLocations ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (normalizedKeyword && !haystack.includes(normalizedKeyword)) {
        return false;
      }

      if (
        selectedEventTypes.length > 0
        && !eventCategories.some((category) => selectedEventTypes.includes(category))
      ) {
        return false;
      }

      if (startBoundary !== null && eventEnd < startBoundary) {
        return false;
      }

      if (endBoundary !== null && event.startYear > endBoundary) {
        return false;
      }

      return true;
    });
  }, [data?.events, endYear, keyword, selectedEventTypes, startYear]);

  const selectedDynasty = useMemo(
    () => data?.dynasties.find((dynasty: Dynasty) => dynasty.id === selectedDynastyId) ?? null,
    [data?.dynasties, selectedDynastyId],
  );

  const activeFocusLabel = useMemo(() => {
    if (selectedEventId) {
      return '事件聚焦';
    }
    if (selectedDynasty) {
      return selectedDynasty.name;
    }
    if (historicalFocusMode === 'playback') {
      return '全局播放';
    }
    return '中国';
  }, [historicalFocusMode, selectedDynasty, selectedEventId]);

  const toggleType = (eventType: string) => {
    setSelectedEventTypes((current) =>
      current.includes(eventType)
        ? current.filter((item) => item !== eventType)
        : [...current, eventType],
    );
  };

  const resetFilters = () => {
    setKeyword('');
    setStartYear('');
    setEndYear('');
    setSelectedEventTypes([]);
    setShowAllEvents(true);
    clearHistoricalSelection();
  };

  if (loading) {
    return (
      <div className="map-workbench map-workbench--state">
        <StateView
          mode="loading"
          title="正在加载地图数据..."
          description="准备历史疆域、事件与地点索引。"
          minHeight="100%"
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="map-workbench map-workbench--state">
        <StateView
          mode="error"
          title="地图数据加载失败"
          description={error instanceof Error ? error.message : '请稍后重试'}
          actionLabel="重试"
          onAction={refresh}
          minHeight="100%"
        />
      </div>
    );
  }

  return (
    <div className="map-workbench" style={MAP_STAGE_STYLE}>
      <div className="map-workbench__map-stage">
        <MapErrorBoundary>
          <EChartsMapView
            events={filteredEvents}
            dynasties={data.dynasties}
            places={data.places}
            historicalFocusMode={historicalFocusMode}
            selectedDynastyId={selectedDynastyId}
            selectedEventId={selectedEventId}
            focusYear={focusYear}
            playheadYear={playheadYear}
            eventFocusRange={eventFocusRange}
            playbackState={playbackState}
            playbackSpeed={playbackSpeed}
            adminBoundaryVisible={adminBoundaryVisible}
            adminBoundaryOpacity={adminBoundaryOpacity}
            dynastyBoundaryVisible={dynastyBoundaryVisible}
            dynastyBoundaryOpacity={dynastyBoundaryOpacity}
            eventMarkersVisible={eventMarkersVisible}
            onDynastySelect={onDynastySelect}
            onFocusYearChange={onFocusYearChange}
            onPlayheadYearChange={onPlayheadYearChange}
            onPlaybackStateChange={onPlaybackStateChange}
            showTimeline={false}
            showStatusOverlay={false}
            showProvincePanel={false}
            showAllEventMarkers={showAllEvents}
            stageMode
            showMapTitle={false}
            {...(showAllEvents ? { maxVisibleEventMarkers: 320 } : {})}
          />
        </MapErrorBoundary>
      </div>

      <section className="map-workbench__filter-panel">
        <div className="map-workbench__panel-title">检索事件</div>

        <label className="map-workbench__search">
          <SearchRoundedIcon fontSize="small" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索人物、地点或事件"
          />
        </label>

        <div className="map-workbench__range-grid">
          <label>
            <span>开始年份</span>
            <input
              type="number"
              value={startYear}
              placeholder={filterBounds.earliestYear}
              onChange={(event) => setStartYear(event.target.value)}
            />
          </label>
          <label>
            <span>结束年份</span>
            <input
              type="number"
              value={endYear}
              placeholder={filterBounds.latestYear}
              onChange={(event) => setEndYear(event.target.value)}
            />
          </label>
        </div>

        <div className="map-workbench__section-heading">事件类型</div>
        <div className="map-workbench__type-grid">
          {eventTypes.map((eventType) => {
            const checked = selectedEventTypes.length === 0 || selectedEventTypes.includes(eventType);
            return (
              <label key={eventType} className="map-workbench__checkbox-row">
                <input type="checkbox" checked={checked} onChange={() => toggleType(eventType)} />
                <span>{eventType}</span>
              </label>
            );
          })}
        </div>

        <div className="map-workbench__panel-footer">
          <button type="button" className="map-workbench__text-button" onClick={resetFilters}>
            重置筛选
          </button>
          <span>{filteredEvents.length} 个事件</span>
        </div>
      </section>

      <div className="map-workbench__status-bar">
        <span className="map-workbench__status-chip">疆域时间：{formatYearLabel(playheadYear ?? focusYear)}</span>
        <span className="map-workbench__status-chip">
          现代行政边界：{adminBoundaryVisible ? '显示' : '隐藏'}
        </span>
        <span className="map-workbench__status-chip">当前聚焦：{activeFocusLabel}</span>
      </div>

      <div className="map-workbench__action-rail">
        <button
          type="button"
          className={`map-workbench__icon-button${adminBoundaryVisible ? ' is-active' : ''}`}
          onClick={toggleAdminBoundary}
          title="切换现代行政边界"
        >
          <PublicRoundedIcon fontSize="small" />
        </button>
        <button
          type="button"
          className={`map-workbench__icon-button${dynastyBoundaryVisible ? ' is-active' : ''}`}
          onClick={toggleDynastyBoundary}
          title="切换历史疆域"
        >
          <TimelineRoundedIcon fontSize="small" />
        </button>
        <button
          type="button"
          className={`map-workbench__icon-button${eventMarkersVisible ? ' is-active' : ''}`}
          onClick={toggleEventMarkers}
          title="切换事件点"
        >
          <PlaceRoundedIcon fontSize="small" />
        </button>
        <button
          type="button"
          className="map-workbench__icon-button"
          onClick={clearHistoricalSelection}
          title="清空地图聚焦"
        >
          <RestartAltRoundedIcon fontSize="small" />
        </button>
      </div>

      <section className="map-workbench__timeline-dock">
        <div className="map-workbench__timeline-toolbar">
          <div className="map-workbench__transport">
            <button type="button" className="map-workbench__transport-button" onClick={() => stepPrevious(1)}>
              <SkipPreviousRoundedIcon fontSize="small" />
            </button>
            <button
              type="button"
              className="map-workbench__transport-button map-workbench__transport-button--primary"
              onClick={playbackState === 'playing' ? pause : play}
            >
              {playbackState === 'playing' ? <PauseRoundedIcon fontSize="small" /> : <PlayArrowRoundedIcon fontSize="small" />}
            </button>
            <button type="button" className="map-workbench__transport-button" onClick={() => stepNext(1)}>
              <SkipNextRoundedIcon fontSize="small" />
            </button>
          </div>

          <div className="map-workbench__year-chip">{formatYearLabel(playheadYear ?? focusYear)}</div>

          <div className="map-workbench__speed-tabs">
            {(['slow', 'medium', 'fast'] as const).map((speed) => (
              <button
                key={speed}
                type="button"
                className={`map-workbench__speed-tab${playbackSpeed === speed ? ' is-active' : ''}`}
                onClick={() => setPlaybackSpeed(speed)}
              >
                {speed === 'slow' ? '0.5x' : speed === 'medium' ? '1x' : '2x'}
              </button>
            ))}
          </div>

          <label className="map-workbench__checkbox-row map-workbench__checkbox-row--inline">
            <input
              type="checkbox"
              checked={showAllEvents}
              onChange={(event) => setShowAllEvents(event.target.checked)}
            />
            <span>显示全部事件</span>
          </label>
        </div>

        <div className="map-workbench__timeline-chart">
          <EChartsTimeline
            dynastiesData={data.dynasties}
            eventsData={[]}
            minHeight={88}
            selectedDynastyId={selectedDynastyId}
            showHeader={false}
            showResetButton={false}
            showCondenseToggle={false}
            showCategoryLabels={false}
            showCategorySeparators={false}
            showDynastyCountBadge={false}
            showSliderZoom={false}
            showEventPoints={false}
            showEventLabels={false}
            enablePan={false}
            enableZoom={false}
            condensedDisplayMode="dynasties-only"
            onDynastyClick={(dynasty) => selectDynasty(dynasty.id, dynasty.startYear)}
            onTimeRangeChange={(range) => setVisibleRange(range)}
          />
        </div>
      </section>
    </div>
  );
}
