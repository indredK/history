import './TimelineList.css';
import { Dynasty3DWheel, D3Timeline } from './components';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { useDynastyStore } from '@/store';
import { dynastyUtils } from '@/config';

export function TimelineList() {
  const { selectedDynasty } = useDynastyStore();
  
  // 获取朝代背景颜色
  const dynastyColor = selectedDynasty?.color;
  const bgColor = dynastyUtils.getBackgroundColor(dynastyColor);

  return (
    <Paper 
      className="timeline-list-container glass-card animate__animated animate__fadeIn" 
      sx={{ 
        padding: { xs: 2, md: 3 },
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        background: 'var(--panel-bg)',
        border: 'var(--panel-border)',
        borderRadius: 'var(--panel-radius)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ mb: 2, alignItems: { xs: 'flex-start', lg: 'flex-end' } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-family-serif)',
              fontSize: { xs: '1.4rem', md: '1.9rem' },
              color: 'var(--color-text-primary)',
              lineHeight: 1.15,
              mb: 0.5,
            }}
          >
            历史时间轴
          </Typography>
          <Typography
            sx={{
              color: 'var(--color-text-secondary)',
              maxWidth: 760,
              fontSize: { xs: '0.9rem', md: '0.98rem' },
            }}
          >
            以朝代切片进入中国历史的长时段叙事，联动人物、疆域与事件脉络。
          </Typography>
        </Box>
        <Box className="timeline-list-meta">
          <span>Chronology</span>
          <strong>{selectedDynasty?.name ?? '全时段'}</strong>
        </Box>
      </Stack>

      {/* 上下布局容器 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2, overflow: 'hidden' }}>
        {/* 朝代选择区域 - 毛玻璃效果 */}
        <Paper 
          className="glass-card"
          sx={{ 
            padding: { xs: 1.5, md: 2 }, 
            overflow: 'hidden', 
            maxHeight: '30vh', 
            background: 'var(--panel-bg-soft)',
            border: 'var(--panel-border)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Dynasty3DWheel />
        </Paper>
        
        {/* 事件时间轴区域 - 应用朝代背景颜色 */}
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
            }
          }}
        >
          <D3Timeline />
        </Paper>
      </Box>
    </Paper>
  );
}
