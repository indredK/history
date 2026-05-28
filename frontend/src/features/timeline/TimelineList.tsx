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
  buildTimelineYearClusters,
  deriveTimelineEvents,
  filterTimelineEvents,
  shouldUseClusterMode,
  shouldUseMajorOnlyMode,
} from './utils/timelineFilters';
import { useMemo } from 'react';

export function TimelineList() {
  usePerformanceTrace('timeline-page-mounted', []);
  const {
    selectedDynastyIds,
    selectedEventTypes,
    keyword,
    jumpRange,
    densityMode,
    currentTimeRange,
    setSelectedDynastyIds,
    setHighlightedDynastyId,
    setCurrentTimeRange,
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
    if (shouldUseMajorOnlyMode(densityMode, currentTimeRange)) {
      return filteredEvents.filter((event) => event.isMajor);
    }

    return filteredEvents;
  }, [currentTimeRange, densityMode, filteredEvents]);
  const yearClusters = useMemo(
    () => (shouldUseClusterMode(currentTimeRange) ? buildTimelineYearClusters(densityFilteredEvents) : []),
    [currentTimeRange, densityFilteredEvents],
  );
  const dynastyClusters = useMemo(
    () =>
      shouldUseClusterMode(currentTimeRange)
        ? buildTimelineDynastyClusters(densityFilteredEvents, data?.dynasties ?? [])
        : [],
    [currentTimeRange, data?.dynasties, densityFilteredEvents],
  );

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
        dynastiesData={data?.dynasties ?? []}
        onTimeRangeChange={setCurrentTimeRange}
        onDynastyClick={(dynasty) => {
          setSelectedDynastyIds((current) =>
            current.length === 1 && current[0] === dynasty.id ? [] : [dynasty.id],
          );
          setHighlightedDynastyId((current) => (current === dynasty.id ? null : dynasty.id));
        }}
        onDynastyDoubleClick={(dynasty) => {
          setHighlightedDynastyId(dynasty.id);
        }}
        clusterData={{
          yearClusters,
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
