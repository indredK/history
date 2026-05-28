import './TimelineList.css';
import { Dynasty3DWheel, EChartsTimeline } from './components';
import { Box, Paper } from '@mui/material';
import { useRequest } from 'ahooks';
import { StateView } from '@/components/ui';
import { getDynasties, getEvents } from '@/services/dataClient';
import { usePerformanceTrace } from '@/utils/performance';

export function TimelineList() {
  usePerformanceTrace('timeline-page-mounted', []);
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
        eventsData={data?.events ?? []}
        dynastiesData={data?.dynasties ?? []}
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
