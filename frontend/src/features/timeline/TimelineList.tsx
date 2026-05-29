import './TimelineList.css';
import { EChartsTimeline } from './components';
import { Box } from '@mui/material';
import { useRequest } from 'ahooks';
import { StateView } from '@/components/ui';
import { getDynasties, getEvents } from '@/services/dataClient';
import { useTimelineStore } from '@/store';
import { usePerformanceTrace } from '@/utils/performance';
import {
  deriveTimelineEvents,
  filterTimelineEvents,
  shouldUseMajorOnlyMode,
} from './utils/timelineFilters';
import { useEffect, useMemo, useState } from 'react';

export function TimelineList() {
  const currentYear = new Date().getFullYear();
  usePerformanceTrace('timeline-page-mounted', []);
  const {
    selectedDynastyIds,
    selectedEventTypes,
    keyword,
    jumpRange,
    densityMode,
    currentTimeRange,
    setJumpRange,
    setCurrentTimeRange,
    resetViewState,
  } = useTimelineStore();
  const {
    data,
    loading,
    error,
    refresh,
  } = useRequest(async () => {
    const [eventsResult, dynastiesResult] = await Promise.all([getEvents(), getDynasties()]);
    return {
      events: eventsResult.data,
      dynasties: dynastiesResult.data,
    };
  });
  const [stableTimeRange, setStableTimeRange] = useState<[number, number] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStableTimeRange(currentTimeRange);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [currentTimeRange]);

  const derivedEvents = useMemo(
    () => deriveTimelineEvents(data?.events ?? []),
    [data?.events],
  );
  const filteredEvents = useMemo(
    () =>
      filterTimelineEvents(derivedEvents, {
        selectedDynastyIds,
        selectedEventTypes,
        keyword,
        jumpRange,
      }),
    [derivedEvents, jumpRange, keyword, selectedDynastyIds, selectedEventTypes],
  );
  const densityFilteredEvents = useMemo(() => {
    if (shouldUseMajorOnlyMode(densityMode, stableTimeRange)) {
      const majorEvents = filteredEvents.filter((event) => event.isMajor);
      return majorEvents.length > 0 ? majorEvents : filteredEvents;
    }

    return filteredEvents;
  }, [densityMode, filteredEvents, stableTimeRange]);
  const dynastyClusters = useMemo(
    () => [],
    [],
  );
  const filteredDynasties = useMemo(() => {
    const allDynasties = data?.dynasties ?? [];
    const scopedDynasties = selectedDynastyIds.length === 0
      ? allDynasties
      : allDynasties.filter((dynasty) => selectedDynastyIds.includes(dynasty.id));

    if (scopedDynasties.length === 0) {
      return scopedDynasties;
    }

    const lastDynasty = scopedDynasties.reduce((latest, dynasty) =>
      dynasty.startYear > latest.startYear ? dynasty : latest,
    scopedDynasties[0]!);

    return scopedDynasties.map((dynasty) =>
      dynasty.id === lastDynasty.id
        ? { ...dynasty, endYear: Math.max(dynasty.endYear ?? dynasty.startYear, currentYear) }
        : dynasty,
    );
  }, [currentYear, data?.dynasties, selectedDynastyIds]);

  const handleTimeRangeChange = (range: [number, number]) => {
    setCurrentTimeRange(range);
    setJumpRange({
      startYear: Math.round(range[0]),
      endYear: Math.round(range[1]),
    });
  };

  const timelineContent = (() => {
    if (loading) {
      return (
        <StateView
          mode="loading"
          title="正在加载时间轴数据..."
          description="整理朝代与事件索引。"
          minHeight="320px"
        />
      );
    }

    if (error) {
      return (
        <StateView
          mode="error"
          title="时间轴数据加载失败"
          description={error instanceof Error ? error.message : '请稍后重试'}
          actionLabel="重试"
          onAction={refresh}
          minHeight="320px"
        />
      );
    }

    return (
      <EChartsTimeline
        eventsData={densityFilteredEvents}
        dynastiesData={filteredDynasties}
        timeRange={currentTimeRange}
        showCondenseToggle={false}
        onTimeRangeChange={handleTimeRangeChange}
        onReset={() => {
          resetViewState();
          setStableTimeRange(null);
        }}
        clusterData={{
          yearClusters: [],
          dynastyClusters,
          densityMode,
        }}
      />
    );
  })();

  return (
    <Box
      className="timeline-list-container glass-card animate__animated animate__fadeIn"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: 2,
        p: { xs: 1.5, md: 2 },
        background: 'var(--panel-bg)',
        border: 'var(--panel-border)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {timelineContent}
    </Box>
  );
}
