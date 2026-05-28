import './TimelineList.css';
import { Dynasty3DWheel, EChartsTimeline } from './components';
import { Box, Drawer, Paper } from '@mui/material';
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
    selectedEventId,
    setCurrentTimeRange,
    setSelectedEventId,
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
  const yearClusters = useMemo(
    () => (shouldUseClusterMode(stableTimeRange) ? buildTimelineYearClusters(densityFilteredEvents) : []),
    [densityFilteredEvents, stableTimeRange],
  );
  const dynastyClusters = useMemo(
    () =>
      shouldUseClusterMode(stableTimeRange)
        ? buildTimelineDynastyClusters(densityFilteredEvents, data?.dynasties ?? [])
        : [],
    [data?.dynasties, densityFilteredEvents, stableTimeRange],
  );
  const filteredDynasties = useMemo(() => {
    const allDynasties = data?.dynasties ?? [];
    if (selectedDynastyIds.length === 0) {
      return allDynasties;
    }

    return allDynasties.filter((dynasty) => selectedDynastyIds.includes(dynasty.id));
  }, [data?.dynasties, selectedDynastyIds]);
  const selectedEvent = useMemo(
    () => densityFilteredEvents.find((event) => event.id === selectedEventId) ?? null,
    [densityFilteredEvents, selectedEventId],
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
        dynastiesData={filteredDynasties}
        selectedEventId={selectedEventId}
        showEventDetail={false}
        onTimeRangeChange={setCurrentTimeRange}
        onEventClick={(event) => setSelectedEventId(event.id)}
        onReset={() => {
          resetViewState();
          setStableTimeRange(null);
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

      <Drawer
        anchor="right"
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEventId(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 360, md: 400 },
              background: 'var(--app-panel-bg)',
              borderLeft: 'var(--app-panel-border)',
              boxShadow: 'var(--app-panel-shadow-lg)',
              color: 'var(--color-text-primary)',
            },
          },
        }}
      >
        {selectedEvent && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              p: 2.25,
              gap: 1.5,
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
              <Box>
                <Box sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35 }}>
                  {selectedEvent.title}
                </Box>
                <Box sx={{ mt: 0.75, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {selectedEvent.startYear}
                  {selectedEvent.endYear && selectedEvent.endYear !== selectedEvent.startYear
                    ? ` - ${selectedEvent.endYear}`
                    : ''}年
                </Box>
              </Box>
              <button
                onClick={() => setSelectedEventId(null)}
                style={{
                  border: '1px solid var(--color-border-medium)',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ×
              </button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedEvent.dynastyId && (
                <Box
                  component="span"
                  sx={{
                    px: 1.2,
                    py: 0.45,
                    borderRadius: '999px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {filteredDynasties.find((dynasty) => dynasty.id === selectedEvent.dynastyId)?.name ?? selectedEvent.dynastyId}
                </Box>
              )}
              {selectedEvent.eventType && (
                <Box
                  component="span"
                  sx={{
                    px: 1.2,
                    py: 0.45,
                    borderRadius: '999px',
                    background: 'rgba(148, 163, 184, 0.14)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {selectedEvent.eventType}
                </Box>
              )}
            </Box>

            {selectedEvent.description && (
              <Box
                sx={{
                  p: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(var(--glass-surface-rgb), 0.35)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                {selectedEvent.description}
              </Box>
            )}
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
