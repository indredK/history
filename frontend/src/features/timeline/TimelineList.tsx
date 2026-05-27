import './TimelineList.css';
import { Dynasty3DWheel, EChartsTimeline } from './components';
import { Box, Paper } from '@mui/material';
import { PageHeaderBadge, PagePanel } from '@/components/common';
import { useDynastyStore } from '@/store';
import { dynastyUtils } from '@/config';
import { usePerformanceTrace } from '@/utils/performance';
import { buildDynastyFocusRange, findDynastyByYear } from './utils/dynastyUtils';
import { useCallback } from 'react';

export function TimelineList() {
  const { selectedDynasty, dynasties, setSelectedDynasty } = useDynastyStore();
  usePerformanceTrace('timeline-page-mounted', []);

  // 获取朝代背景颜色
  const dynastyColor = selectedDynasty?.color;
  const bgColor = dynastyUtils.getBackgroundColor(dynastyColor);
  const focusRange = buildDynastyFocusRange(selectedDynasty);

  const handleTimeRangeChange = useCallback(
    (range: [number, number]) => {
      if (dynasties.length === 0) return;
      const center = (range[0] + range[1]) / 2;
      const found = findDynastyByYear(center, dynasties);
      if (found && found.id !== selectedDynasty?.id) {
        setSelectedDynasty(found);
      }
    },
    [dynasties, selectedDynasty, setSelectedDynasty],
  );

  return (
    <PagePanel
      title="历史时间轴"
      description="以朝代切片进入中国历史的长时段叙事，联动人物、疆域与事件脉络。"
      headerAside={
        <PageHeaderBadge
          label="Chronology"
          value={selectedDynasty?.name ?? '全时段'}
        />
      }
      className="timeline-list-container glass-card animate__animated animate__fadeIn"
      sx={{
        background: 'var(--panel-bg)',
        border: 'var(--panel-border)',
        boxShadow: 'var(--shadow-lg)',
        p: { xs: 2, md: 3 },
      }}
      contentSx={{ gap: 2 }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2, overflow: 'hidden' }}>
        <Paper
          className="glass-card"
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

        <Paper
          className="timeline-content-area"
          sx={{
            flex: 1,
            padding: { xs: 1.5, md: 2 },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: selectedDynasty
              ? `linear-gradient(180deg, ${bgColor} 0%, var(--color-bg-card) 100%)`
              : 'var(--panel-bg-soft)',
            border: 'var(--panel-border)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background 350ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: selectedDynasty
                ? `linear-gradient(180deg, ${bgColor} 0%, var(--color-bg-card) 100%)`
                : 'var(--panel-bg-soft)',
            },
          }}
        >
          <EChartsTimeline
            focusRange={focusRange}
            focusLabel={selectedDynasty?.name ?? null}
            onTimeRangeChange={handleTimeRangeChange}
          />
        </Paper>
      </Box>
    </PagePanel>
  );
}
