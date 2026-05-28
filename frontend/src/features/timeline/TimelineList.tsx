import './TimelineList.css';
import { Dynasty3DWheel, EChartsTimeline } from './components';
import { Box, Paper } from '@mui/material';
import { useRequest } from 'ahooks';
import { StateView } from '@/components/ui';
import { getDynasties, getEvents } from '@/services/dataClient';
import { useTimelineStore } from '@/store';
import { usePerformanceTrace } from '@/utils/performance';
import {
  buildTimelineDynastyClusters,
  deriveTimelineEvents,
  filterTimelineEvents,
  shouldUseClusterMode,
  shouldUseMajorOnlyMode,
} from './utils/timelineFilters';
import { useEffect, useMemo, useState } from 'react';

export function TimelineList() {
  usePerformanceTrace('timeline-page-mounted', []);
  const {
    selectedDynastyIds,
    selectedEventTypes,
    keyword,
    jumpRange,
    densityMode,
    currentTimeRange,
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
    if (selectedDynastyIds.length === 0) {
      return allDynasties;
    }

    return allDynasties.filter((dynasty) => selectedDynastyIds.includes(dynasty.id));
  }, [data?.dynasties, selectedDynastyIds]);

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
        onTimeRangeChange={setCurrentTimeRange}
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
        p: { xs: 2, md: 3 },
        background: 'var(--panel-bg)',
        border: 'var(--panel-border)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <Paper
        className="glass-card dynasty-wheel-container"
        sx={{
          padding: { xs: 1.5, md: 2 },
          overflow: 'hidden',
          maxHeight: '30vh',
          background: 'var(--panel-bg-soft)',
          border: 'var(--panel-border)',
          borderRadius: '14px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Dynasty3DWheel />
      </Paper>

      {timelineContent}
    </Box>
  );
}
